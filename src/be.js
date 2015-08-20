function Be() {
  var registerElement = document.registerElement || document.register;
  if (!registerElement) throw new Error('Web Components are not supported');
  registerElement = registerElement.bind(document);

  var parent = Object.create(React);
  parent.createElement = React.createElement;

  var base = {}, namespace = base;
  createNamespace();

  Be = this;
  Be.createNamespace = createNamespace;
  Be.destroyNamespace = destroyNamespace;
  Be.registerElement = registerElement;
  Be.exec = exec;
  Be.load = load;
  React.createElement = createElement;

  function createNamespace() {
    var parent = namespace;
    namespace = Object.create(namespace);
    namespace.parent = namespace;
  };
  function destroyNamespace() {
    if (namespace.parent === base) throw 'No namespace available';
    namespace = namespace.parent;
  }
  function exec(source, options) {
    return JSXTransformer.exec(source, options);
  }
  function load(href, method, data, type) {
    var xhr = new XMLHttpRequest;
    if (!xhr) return false;
    xhr.open(method || 'GET', href, true);
    xhr.onreadystatechange = stateChange;
    if (data) setRequestHeader('Content-Type', type || 'application/x-www-form-urlencoded');
    xhr.send(data || null);

    function stateChange() {
      if (xhr.readyState != 4 || xhr.status != 200 && xhr.status != 304) return;
      load(xhr.responseText);
    }
    function load(data) {
      //data = JSON.parse(data);
      console.log(exec(data));
    }
  };
  function createElement(type) {
    if (typeof type == 'string') {
      if (namespace[type] === base[type]) {
        alert([1,type,2]);
        var component = namespace[type] = this.createClass({ render: render });
        component.type = type;
        type = component;
      }
      else type = namespace[type];
    }
    arguments[0] = type;
    console.log(arguments);
    var element = parent.createElement.apply(parent, arguments), object = Object.create(element);
    object.prototype = type.prototype;
    return element;

    function render() {
      console.log(element.props.children);
      return parent.createElement("h2", null, element.props.children);
    }
  };

  var observer = new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) { // TODO: optimize
      var nodes = mutations[i].addedNodes;
      for (var j = 0; j < nodes.length; j++) swift(nodes[j]);
    }
  });
  //observer.observe(document.documentElement, { childList: true, subtree: true });

  function render() {
    return this.createElement("button");
  }
  function routes(routes) {
    return routes.forEach(route);
  };
  function route(route) {

  }

  function navigate() {

  }

  function swift(node) {
    if (stop) return;
    switch (node.nodeType) {
      case 1:
        var type = node.tagName.toLowerCase();
        if (namespace[type] !== base[type]) bind(node);
        //var desc = node.getElementsByTagName('*');
        //for (var j = 0; j < desc.length; j++) if (factories[i].pattern.test(desc[j].tagName)) bind(desc[j]);
        break;
      default: for (var i = 0, children = node.childNodes; i < children.length; i++) swift(children[i]);
    }
  }
  function bind(node) {
    console.debug('Bind', node);
    stop = 1;
    React.render(transform(node), node);
  }
  function transform(node) {
    switch (node.nodeType) {
      case 1:
        var props = {}, args = [ node.tagName.toLowerCase(), props ];
        for (var i = 0, attrs = node.attributes; i < attrs.length; i++) {
          var attr = attrs[i];
          if (attr.specified) props[attr.name] = attr.value;
        }
        for (var i = 0, children = node.children; i < children.length; i++) args.push(transform(children[i]));
        return this.createElement.apply(this, args);
      case 3: return node.data;
      default: return null;
    }
  }
  var stop;

}
Be.prototype = React;
be = new Be;
