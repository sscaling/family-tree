function App() {
    return <div>{ new Date().getTime() }</div>;
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
);
