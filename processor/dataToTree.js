var _ = require('underscore');

function Relationship(t) {
    start = 1482249061000;
    end = undefined;
    target = t;
}

function Node() {
    id = 1;
    name = 'John Smith';
    // date-of-birth
    dob = 1482249061000;
    // date-of-death
    dod = undefined;
    // sex
    male = true;

    mother = new Node();
    father = new Node();

    spouse = [new Relationship(2)];

    children = [new Node(), new Node()];
}

//
// Scenarios
/*

           *     *  (ancestors -> mum / dad)
           |     |
           +--+--+
              |
           +--+--+
           |     |
 (sibling) *    (*)    * (0:n spouses)
[implicit]       |     |
                 +--+--+
                    |
                    * (0:n children)

 */


// NOTE: order of data is important... how would we do select? how would we make it not important?
// DO we need spouse here? is this additional data to enhance the structure with
var treeInput = [
    {id: 1, name: 'Dad', dob: -600652800000, male: true, spouse: [2]},
    {id: 7, name: 'Son-in-law', dob:516326400000, male: true, spouse:[4]},
    {id: 2, name: 'Mum', dob: -561686400000, male: false, spouse: [1]},
    //{id: 8, name: 'Ex-wife', dob: -561686400000, male: false, spouse: [1]},
    {id: 3, name: 'Son', dob: 468115200000, male: true, father: 1, mother: 2, spouse: [4]},
    {id: 4, name: 'Daughter', dob: 271900800000, male: false, father: 1, mother: 2},
    {id: 5, name: 'Daughter-in-law', dob: 516326400000, male: false, spouse: [3]},
    {id: 6, name: 'Grandaughter', dob: 1281744000000, male: false, father: 3, mother: 5},
    //{id: 9, name: 'Step-son', dob: 468115200000, male: true, mother: 8}


    {id: 10, name: 'Son2', dob: 468115200000, male: true, father: 1, mother: 11},
    {id: 11, name: 'Mum2', dob: 468115200000, male: false}

];

/**

     1--+--2
        |
     +--+--+     ?
     |     |     |
     4     3--+--5
              |
              6


 is this really?

      1     or    2      or   5
    4   3       4   3         6
        6           6

 How would this be drawn?

 1) find all parents without a mother & father
    (1,2,5)
 2) pick two (a,b) (1, 2)
 3) for each node in a, see if there is a join in node b
    (joins on 3, update depth)
 4) Remove duplicates
 5) pick remaining nodes, and repeat 3
    (joins on 6)

 results in

 node.id
 node.depth
 node.parents[]
 node.children[]

 5) find deepest point
 6) start calculating layout?
 7) ???
 */

var debug = true;
var root = [];

function addNode(node, toAdd) {

    debug && console.log('current node %j', node);

    var created = false;

    var newNode = {
        ids: [toAdd.id],
        depth: (node.depth + 1),
        children: []
    };

    var isMother = _.contains(node.ids, toAdd.mother);
    var isFather = _.contains(node.ids, toAdd.father);
    if (isMother || isFather) {
        // is the node a direct descendant of the node, add it

        debug && console.log('Found mother or father for %j', newNode);

        //newNode.parents = [];
        //if (toAdd.mother) newNode.parents.push(toAdd.mother);
        if (!_.contains(node.ids, toAdd.mother)) node.ids.push(toAdd.mother);
        //if (toAdd.father) newNode.parents.push(toAdd.father);
        if (!_.contains(node.ids, toAdd.father)) node.ids.push(toAdd.father);

        node.children.push(newNode);
        created = true;
    } else if (_.contains(node.ids, toAdd.id) /*|| _.contains(node.parents, toAdd.id)*/) {
        // nothing to do, this can be dropped
        created = true;
    } else if (_.intersection(node.ids, toAdd.spouse).length > 0) {
        // FIXME: multiple spouse's is broken
        //        model needs to be updated

        // spouse match

        debug && console.log('Found spouse in %j for %j', node.ids, toAdd);

        node.ids.push(toAdd.id);
        created = true;
    } else {
        // search children to see if toAdd's parent matches

        var children = node.children;

        // add node to first child that is found
        for (var c in children) {
            if (!created && children.hasOwnProperty(c)) {
                created = addNode(children[c], toAdd);

                // optimization
                //if (created) break;
            }
        }
    }

    return created;
}

// for anything that can't be added, put in the orphaned queue
var orphaned = [];
function createTree(root, toAdd) {
    var rootNode = {
        ids: [toAdd.id],
        depth: 1,
        children: []
    };

    if (root.length === 0) {
        // first one!
        debug && console.log('adding root %j', rootNode);
        root.push(rootNode);
    } else {
        var created = false;

        for (var n in root) {
            if (!created && root.hasOwnProperty(n) && 'object' === typeof root[n]) {
                created = addNode(root[n], toAdd);
            }
        }

        if (!created) {
            // couldn't find parent, so create a new root node
            debug && console.log('orphaned node %j', toAdd);
            orphaned.push(toAdd);
        }
    }
}

// 1) build trees
for (var i in treeInput) {
    if (treeInput.hasOwnProperty(i)) {
        createTree(root, treeInput[i]);
    }
}

// 2) attach orphaned nodes
var maxAttempts = 2;
while (orphaned.length > 0) {
    var o = orphaned.shift();

    console.log('... trying to seat orphaned node %j', o);

    var created = false;
    _.each(root, function (node) {
        if (addNode(node, o)) {
            console.log('located orphaned node');
            created = true;
        }
    });

    if (!created) {
        // add to back and try again later
        ('number' === typeof o.attempts) ? o.attempts++ : o.attempts = 0;

        // ... if not exceeded max attempts
        if (o.attempts <= maxAttempts) {
            orphaned.push(o);
        }
        else {
            console.log('unable to seat orphaned node %j', o);
            // must be an orphaned root node
            root.push({
                ids: [o.id],
                depth: 1,
                children: []
            });
        }
    }
}

console.log('Root has %j elements', root.length);
for (var x in root) {
    console.log('-----\n%j', root[x]);
}





//
//
//var tree = {};
//
//function find(node, id) {
//    if ('number' !== typeof id) {
//        throw new Error('id is not a number');
//    }
//
//    var found;
//
//    if (node.id === id) {
//        // it's this node
//        found = node;
//    } else {
//        // spouse
//        for (var s in node.spouse) {
//            if (node.spouse.hasOwnProperty(s)) {
//                found = find(node.spouse[s], id);
//                if (found) break;
//            }
//        }
//
//        if (!found) {
//            // children
//            for (var c in node.children) {
//                if (node.children.hasOwnProperty(c)) {
//                    found = find(node.children[c], id);
//                    if (found) break;
//                }
//            }
//        }
//    }
//
//    return found;
//}
//
//function addNode(tree, toAdd) {
//
//    console.log('\nAdding "%s"', toAdd.name);
//
//    var success = false;
//
//    var node = {
//        id: toAdd.id,
//        spouse: [],
//        children: [],
//        mother: undefined,
//        father: undefined
//    };
//
//    //// lookup table for id->node
//    idx[toAdd.id] = node;
//
//    if (!tree.root) {
//        // if it's the first it has to be the root
//        tree.root = node;
//        success = true;
//    } else {
//
//        // not so simple, we need to look where this could join the tree
//        // mother / father / spouse
//
//        if (toAdd.mother) {
//            var mother = find(tree.root, toAdd.mother);
//
//            console.log('found mother %j', mother);
//
//            if (mother) {
//                mother.children.push(node);
//                success = true;
//            }
//        }
//
//        if (toAdd.father) {
//            var father = find(tree.root, toAdd.father);
//
//            console.log('found father %j', father);
//
//            if (father) {
//                father.children.push(node);
//                success = true;
//            }
//        }
//
//        if (toAdd.spouse && toAdd.spouse.length > 0) {
//            for (var s in toAdd.spouse) {
//                var thatSpouse = find(tree.root, toAdd.spouse[s]);
//
//                console.log('found spouse %j', thatSpouse);
//
//                if (thatSpouse) {
//                    node.spouse.push(thatSpouse.id);
//                    thatSpouse.spouse.push(node.id);
//                    success = true;
//                }
//            }
//        }
//    }
//
//    return success;
//}
//
//for (var i in treeInput) {
//    if (treeInput.hasOwnProperty(i)) {
//        addNode(tree, treeInput[i]);
//    }
//}
//
//
//console.log('\n\nDONE');
//
//function printTree(node) {
//    console.log(node.name + " " + ('object' === typeof node.spouse[0] ? node.spouse[0].name : ""));
//
//}
//printTree(tree.root);