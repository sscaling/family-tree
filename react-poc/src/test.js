// from dataToTree.js
var input = {
    "ids": [1, 2],
    "depth": 1,
    "children": [{"ids": [3, 5], "depth": 2, "children": [{"ids": [6], "depth": 3, "children": []}]}, {
        "ids": [4, 7],
        "depth": 2,
        "children": []
    }]
};

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
        function clicky(e, value) {
            e.preventDefault();
            window.alert(value);
        }

        // all the sibblings
        var nodes = node.ids.map((i) =>
            <a href="#" key={i} onClick={(e) => clicky(e, i)}>{i}</a>
        );

        // ... recurse the children
        var self = this;
        var childrenNodes = [];
        if (node.children.length > 0) {
            node.children.forEach(function (x) {
                childrenNodes.push(self.buildTree(x));
            });
        }

        // ... don't render child ul's if no data is present
        var children = childrenNodes.length > 0 ? <ul>{ childrenNodes }</ul> : "";

        // for react, need to give each nested element a unique 'key'
        return <li key={ this.idx++ }>
            { nodes }
            { children }
        </li>;
    }

    render() {
        return <div className="tree">
            <ul>{ this.state.tree }</ul>
        </div>;
    }
}

ReactDOM.render(
    <App tree={ input }/>,
    document.getElementById('root')
);
