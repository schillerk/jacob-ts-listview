Notes:
react dev tools in chrome slow it wayy down -- should this be a worry for users who are developers? or does prod mode disable
cursor position on gestalts doesn't work in safari


Can switch between    
```javascript
<ListView />,
// <ListViewSlow1 />,
in src/index.tsx
```

https://basarat.gitbooks.io/typescript/content/docs/quick/nodejs.html


Known errors :

1. To reproduce:
build ideaflow! > bring peace to world... ; build ideaflow!; build ideaflow! > hack with jacob; then childmost bring peace

Assertion failed: instanceId: 1.1..0, part: 
ListView.tsx:226 Uncaught TypeError: Cannot read property 'children' of undefined
    at http://localhost:8000/dist/bundle.js:209:38
    at Array.forEach (native)
    at ListView._this.findGestaltInstance (http://localhost:8000/dist/bundle.js:206:22)
    at Object.ListView._this.toggleExpand (http://localhost:8000/dist/bundle.js:217:48)
    at onClick (http://localhost:8000/dist/bundle.js:17531:97)
    at Object.ReactErrorUtils.invokeGuardedCallback (http://localhost:8000/node_modules/react-dom/dist/react-dom.js:8999:16)
    at executeDispatch (http://localhost:8000/node_modules/react-dom/dist/react-dom.js:3006:21)
    at Object.executeDispatchesInOrder (http://localhost:8000/node_modules/react-dom/dist/react-dom.js:3029:5)
    at executeDispatchesAndRelease (http://localhost:8000/node_modules/react-dom/dist/react-dom.js:2431:22)
    at executeDispatchesAndReleaseTopLevel (http://localhost:8000/node_modules/react-dom/dist/react-dom.js:2442:10)

2. Doesn't work:
shouldComponentUpdate
        return !(_.isEqual(nextProps.gestaltInstance, this.props.gestaltInstance))


3. #ux most recently clicked child should come up on top
                //#TODO move to front of array when expanding and deepFixGestaltInstanceIds?
