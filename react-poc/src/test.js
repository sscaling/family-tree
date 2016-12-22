// from dataToTree.js
var input = {"ids":[1,2],"depth":1,"children":[{"ids":[3,5],"depth":2,"children":[{"ids":[6],"depth":3,"children":[]}]},{"ids":[4,7],"depth":2,"children":[]}]};

//var input = {
//    "ids": [1],
//    "depth": 1,
//    "children": [{"ids": [5], "depth": 2, "children": []}, {"ids": [6], "depth": 3, "children": []}]
//};

class App extends React.Component {

    constructor(props) {
        super(props);

        this.idx = 0;
        console.log(props.tree);

        this.state = {
            tree: this.buildTree(props.tree)
        };
    }

    buildTree(node) {
        var self = this;

        // array of this node + siblings
        var nodes = node.ids.map((i) =>
            <a href="#" key={i}>{i}</a>
        );

        var children = [];
        if (node.children.length > 0) {
            node.children.forEach(function (x) {
                children.push(self.buildTree(x));
            });
        }

        console.log('nodes');
        console.log(nodes);
        console.log('children');
        console.log(children);

        return <li key={ this.idx++ }>
                { nodes }
                { children.length > 0 ? <ul>{ children }</ul> : "" }
            </li>;
    }

    render() {
        return <div className="tree"><ul>{ this.state.tree }</ul></div>;
    }
}

ReactDOM.render(
    <App tree={ input }/>,
    document.getElementById('root')
);
