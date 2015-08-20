<esanum-header/>.element.render = function () {

};


function Be() {
  var registerElement = document.registerElement || document.register;
  if (!registerElement) throw new Error('Web Components are not supported');
  registerElement = registerElement.bind(document);

  var be = this, factories = [], base = React.DOM, dictionary = base;

  var createElement = React.createElement.bind(React);

  be.registerFactory = function register(pattern, factory) {
    dictionary = Object.create(dictionary);
    factories.push({ pattern: pattern, source: factory || be.toClassName, dictionary: dictionary });
    for (var i = 0, elements = document.getElementsByTagName('*'); i < elements.length; i++)
      if (pattern.test(elements[i].tagName.toLowerCase())) bind(elements[i]); // TODO: optimize
  };
  be.registerElement = function register(name, factory) {
    dictionary = Object.create(dictionary);
    dictionary[pattern] = factory || be.toClassName;
  }
  be.toClassName = function toClassName(string) {
    return string.replace(/(?:[-_]|^)(\w)/g, function (match, letter) { return letter.toUpperCase(); });
  };
  be.exec = function exec(source, options) {
    return JSXTransformer.exec(source, options);
  };
  be.load = function load(href, method, data, type) {
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
      console.log(be.exec(data));
    }
  };
  React.createElement = be.createElement = function create(type) {
    if (typeof type == 'string') {
      if (!dictionary[type]) for (var i = 0; i < factories.length; i++) {
        var factory = factories[i];
        if (factory.pattern.test(type)) {
          var component = factory.dictionary[type] = typeof factory.source == 'function' ? factory.source(type) : factory.source[type];
          if (typeof component == 'string') try { component = eval('with(window){'+component+'\n}'); } catch (e) { component = null; console.debug('Create component <'+type+'/>: '+e.message); }
          if (!component || typeof component == 'function') dictionary[type] = component;
        }
      }
      if (typeof dictionary[type] == 'function') type = dictionary[type];
    }
    arguments[0] = type;
    return createElement.apply(this, arguments);
  };

  var observer = new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) { // TODO: optimize
      var nodes = mutations[i].addedNodes;
      for (var j = 0; j < nodes.length; j++) swift(nodes[j]);
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });


  be.routes = function routes(routes) {
    return routes.forEach(be.route);
  };
  be.route = function route(route) {

  }

  function navigate() {

  }

  function swift(node) {
    if (stop) return;
    switch (node.nodeType) {
      case 1:
        //var desc = node.getElementsByTagName('*');
        for (var i = 0; i < factories.length; i++) {
          if (factories[i].pattern.test(node.tagName.toLowerCase())) bind(node);
          //for (var j = 0; j < desc.length; j++) if (factories[i].pattern.test(desc[j].tagName)) bind(desc[j]);
        }
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
        return be.createElement.apply(be, args);
      case 3: return node.data;
      default: return null;
    }
  }
  var stop;

}
Be.prototype = React;
be = new Be;
