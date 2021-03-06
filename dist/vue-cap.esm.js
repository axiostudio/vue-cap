import axios from 'axios';
import _ from 'lodash';

//

var script = {
	name: 'VueCap',

	props: {
        indirizzo: {
			type: Object,
			default: function () {
                return {
                    provincia: '',
                    comune: '',
                    cap: ''
                }
            }
		}
	},

	data: function data() {
		return {
			raw: false,
			base: {
				province: [],
				comuni: [],
				cap: [],
			},
		};
	},

	watch: {
		'indirizzo.provincia': function (p) {
			if (p) {
				this.indirizzo.comune = '';
				this.indirizzo.cap = '';
				this.getComuni(p);
			}
		},

		'indirizzo.comune': function (c) {
			if (c) {
				this.indirizzo.cap = '';
				this.getCap(c);
			}
		},
	},

	methods: {
		getRaw: function () {
			var this$1 = this;

			axios.get('https://raw.githubusercontent.com/matteocontrini/comuni-json/master/comuni.json')
            .then(function (ref) {
                var data = ref.data;

                this$1.raw = data;
                this$1.getProvince();
            })
            .catch(function (error) {
                alert(error.response.data);
            });
		},

		getProvince: function getProvince() {
			// console.log('getProvince');

			this.base.province = _.chain(this.raw)
				.orderBy('sigla')
				.map(function (city) {
					return {
						value: city.sigla,
						text: city.provincia.nome + ' (' + city.sigla + ')',
					};
				})
				.uniqBy('value')
				.value();

			if (this.indirizzo.provincia) {
				this.getComuni(this.indirizzo.provincia);
			}
		},

		getComuni: function getComuni(p) {
			// console.log('getComuni', p);

			this.base.comuni = _.chain(this.raw)
				.filter({ sigla: p })
				.orderBy('nome')
				.map(function (c) {
					return {
						value: c.nome,
						text: c.nome
					};
				})
				.value();

			if (this.indirizzo.comune) {
				this.getCap(this.indirizzo.comune);
			}
		},

		getCap: function getCap(c) {
			// console.log('getCap', c);

			var citta = _.chain(this.raw).filter({ nome: c }).head().value();

			this.base.cap = _.map(citta.cap, function (zip) {
				return {
					value: zip,
					text: zip,
				};
			});

			if (this.base.cap.length == 1) {
				this.indirizzo.cap = _.head(this.base.cap).value;
			}
		},
	},

	mounted: function mounted() {
		this.getRaw();
	},
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    var options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    var hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            var originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            var existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}

var isOldIE = typeof navigator !== 'undefined' &&
    /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
    return function (id, style) { return addStyle(id, style); };
}
var HEAD;
var styles = {};
function addStyle(id, css) {
    var group = isOldIE ? css.media || 'default' : id;
    var style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
    if (!style.ids.has(id)) {
        style.ids.add(id);
        var code = css.source;
        if (css.map) {
            // https://developer.chrome.com/devtools/docs/javascript-debugging
            // this makes source maps inside style tags work properly in Chrome
            code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
            // http://stackoverflow.com/a/26603875
            code +=
                '\n/*# sourceMappingURL=data:application/json;base64,' +
                    btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
                    ' */';
        }
        if (!style.element) {
            style.element = document.createElement('style');
            style.element.type = 'text/css';
            if (css.media)
                { style.element.setAttribute('media', css.media); }
            if (HEAD === undefined) {
                HEAD = document.head || document.getElementsByTagName('head')[0];
            }
            HEAD.appendChild(style.element);
        }
        if ('styleSheet' in style.element) {
            style.styles.push(code);
            style.element.styleSheet.cssText = style.styles
                .filter(Boolean)
                .join('\n');
        }
        else {
            var index = style.ids.size - 1;
            var textNode = document.createTextNode(code);
            var nodes = style.element.childNodes;
            if (nodes[index])
                { style.element.removeChild(nodes[index]); }
            if (nodes.length)
                { style.element.insertBefore(textNode, nodes[index]); }
            else
                { style.element.appendChild(textNode); }
        }
    }
}

/* script */
var __vue_script__ = script;

/* template */
var __vue_render__ = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { staticClass: "vue-cap" },
    [
      _vm.raw
        ? [
            _c("div", { staticClass: "vue-cap-item" }, [
              _c("label", { attrs: { for: "vue-cap-provincia" } }, [
                _vm._v("Provincia")
              ]),
              _vm._v(" "),
              _c(
                "select",
                {
                  directives: [
                    {
                      name: "model",
                      rawName: "v-model",
                      value: _vm.indirizzo.provincia,
                      expression: "indirizzo.provincia"
                    }
                  ],
                  attrs: { name: "provincia", id: "vue-cap-provincia" },
                  on: {
                    change: function($event) {
                      var $$selectedVal = Array.prototype.filter
                        .call($event.target.options, function(o) {
                          return o.selected
                        })
                        .map(function(o) {
                          var val = "_value" in o ? o._value : o.value;
                          return val
                        });
                      _vm.$set(
                        _vm.indirizzo,
                        "provincia",
                        $event.target.multiple
                          ? $$selectedVal
                          : $$selectedVal[0]
                      );
                    }
                  }
                },
                [
                  _c("option", { attrs: { value: "" } }),
                  _vm._v(" "),
                  _vm._l(_vm.base.province, function(p) {
                    return _c(
                      "option",
                      { key: p.value, domProps: { value: p.value } },
                      [_vm._v(_vm._s(p.text))]
                    )
                  })
                ],
                2
              )
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "vue-cap-item" }, [
              _c("label", { attrs: { for: "vue-cap-comune" } }, [
                _vm._v("Comune")
              ]),
              _vm._v(" "),
              _c(
                "select",
                {
                  directives: [
                    {
                      name: "model",
                      rawName: "v-model",
                      value: _vm.indirizzo.comune,
                      expression: "indirizzo.comune"
                    }
                  ],
                  attrs: {
                    name: "comune",
                    id: "vue-cap-comune",
                    disabled: _vm.indirizzo.provincia == ""
                  },
                  on: {
                    change: function($event) {
                      var $$selectedVal = Array.prototype.filter
                        .call($event.target.options, function(o) {
                          return o.selected
                        })
                        .map(function(o) {
                          var val = "_value" in o ? o._value : o.value;
                          return val
                        });
                      _vm.$set(
                        _vm.indirizzo,
                        "comune",
                        $event.target.multiple
                          ? $$selectedVal
                          : $$selectedVal[0]
                      );
                    }
                  }
                },
                [
                  _c("option", { attrs: { value: "" } }),
                  _vm._v(" "),
                  _vm._l(_vm.base.comuni, function(c) {
                    return _c(
                      "option",
                      { key: c.value, domProps: { value: c.value } },
                      [_vm._v(_vm._s(c.text))]
                    )
                  })
                ],
                2
              )
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "vue-cap-item" }, [
              _c("label", { attrs: { for: "vue-cap-cap" } }, [_vm._v("CAP")]),
              _vm._v(" "),
              _c(
                "select",
                {
                  directives: [
                    {
                      name: "model",
                      rawName: "v-model",
                      value: _vm.indirizzo.cap,
                      expression: "indirizzo.cap"
                    }
                  ],
                  attrs: {
                    name: "cap",
                    id: "vue-cap-cap",
                    disabled: _vm.indirizzo.comune == ""
                  },
                  on: {
                    change: function($event) {
                      var $$selectedVal = Array.prototype.filter
                        .call($event.target.options, function(o) {
                          return o.selected
                        })
                        .map(function(o) {
                          var val = "_value" in o ? o._value : o.value;
                          return val
                        });
                      _vm.$set(
                        _vm.indirizzo,
                        "cap",
                        $event.target.multiple
                          ? $$selectedVal
                          : $$selectedVal[0]
                      );
                    }
                  }
                },
                [
                  _c("option", { attrs: { value: "" } }),
                  _vm._v(" "),
                  _vm._l(_vm.base.cap, function(z) {
                    return _c(
                      "option",
                      { key: z.value, domProps: { value: z.value } },
                      [_vm._v(_vm._s(z.text))]
                    )
                  })
                ],
                2
              )
            ])
          ]
        : _c("div", [_vm._v("Loading...")])
    ],
    2
  )
};
var __vue_staticRenderFns__ = [];
__vue_render__._withStripped = true;

  /* style */
  var __vue_inject_styles__ = function (inject) {
    if (!inject) { return }
    inject("data-v-82ebed0a_0", { source: ".vue-cap .vue-cap-item label[data-v-82ebed0a], .vue-cap .vue-cap-item select[data-v-82ebed0a] {\n  display: block;\n  width: 100%;\n}\n\n/*# sourceMappingURL=vue-cap.vue.map */", map: {"version":3,"sources":["/Users/andrearufo/Sites/code/vue-cap/src/vue-cap.vue","vue-cap.vue"],"names":[],"mappings":"AAgKA;EACA,cAAA;EACA,WAAA;AC/JA;;AAEA,sCAAsC","file":"vue-cap.vue","sourcesContent":["<template>\n\t<div class=\"vue-cap\">\n\n\t\t<template v-if=\"raw\">\n\n            <div class=\"vue-cap-item\">\n                <label for=\"vue-cap-provincia\">Provincia</label>\n                <select name=\"provincia\" id=\"vue-cap-provincia\" v-model=\"indirizzo.provincia\">\n                    <option value=\"\"></option>\n                    <option v-for=\"p in base.province\" :key=\"p.value\" :value=\"p.value\">{{ p.text }}</option>\n                </select>\n            </div>\n\n            <div class=\"vue-cap-item\">\n                <label for=\"vue-cap-comune\">Comune</label>\n                <select name=\"comune\" id=\"vue-cap-comune\" v-model=\"indirizzo.comune\" :disabled=\"indirizzo.provincia == ''\">\n                    <option value=\"\"></option>\n                    <option v-for=\"c in base.comuni\" :key=\"c.value\" :value=\"c.value\">{{ c.text }}</option>\n                </select>\n            </div>\n\n            <div class=\"vue-cap-item\">\n                <label for=\"vue-cap-cap\">CAP</label>                \n                <select name=\"cap\" id=\"vue-cap-cap\" v-model=\"indirizzo.cap\" :disabled=\"indirizzo.comune == ''\">\n                    <option value=\"\"></option>\n                    <option v-for=\"z in base.cap\" :key=\"z.value\" :value=\"z.value\">{{ z.text }}</option>\n                </select>\n            </div>\n\n\t\t</template>\n        <div v-else>Loading...</div>\n\n\t</div>\n</template>\n\n<script>\nimport axios from 'axios';\nimport _ from 'lodash';\n\nexport default {\n\tname: 'VueCap',\n\n\tprops: {\n        indirizzo: {\n\t\t\ttype: Object,\n\t\t\tdefault: () => {\n                return {\n                    provincia: '',\n                    comune: '',\n                    cap: ''\n                }\n            }\n\t\t}\n\t},\n\n\tdata() {\n\t\treturn {\n\t\t\traw: false,\n\t\t\tbase: {\n\t\t\t\tprovince: [],\n\t\t\t\tcomuni: [],\n\t\t\t\tcap: [],\n\t\t\t},\n\t\t};\n\t},\n\n\twatch: {\n\t\t'indirizzo.provincia': function (p) {\n\t\t\tif (p) {\n\t\t\t\tthis.indirizzo.comune = '';\n\t\t\t\tthis.indirizzo.cap = '';\n\t\t\t\tthis.getComuni(p);\n\t\t\t}\n\t\t},\n\n\t\t'indirizzo.comune': function (c) {\n\t\t\tif (c) {\n\t\t\t\tthis.indirizzo.cap = '';\n\t\t\t\tthis.getCap(c);\n\t\t\t}\n\t\t},\n\t},\n\n\tmethods: {\n\t\tgetRaw: function () {\n\t\t\taxios.get('https://raw.githubusercontent.com/matteocontrini/comuni-json/master/comuni.json')\n            .then(({ data }) => {\n                this.raw = data;\n                this.getProvince();\n            })\n            .catch((error) => {\n                alert(error.response.data);\n            });\n\t\t},\n\n\t\tgetProvince() {\n\t\t\t// console.log('getProvince');\n\n\t\t\tthis.base.province = _.chain(this.raw)\n\t\t\t\t.orderBy('sigla')\n\t\t\t\t.map((city) => {\n\t\t\t\t\treturn {\n\t\t\t\t\t\tvalue: city.sigla,\n\t\t\t\t\t\ttext: city.provincia.nome + ' (' + city.sigla + ')',\n\t\t\t\t\t};\n\t\t\t\t})\n\t\t\t\t.uniqBy('value')\n\t\t\t\t.value();\n\n\t\t\tif (this.indirizzo.provincia) {\n\t\t\t\tthis.getComuni(this.indirizzo.provincia);\n\t\t\t}\n\t\t},\n\n\t\tgetComuni(p) {\n\t\t\t// console.log('getComuni', p);\n\n\t\t\tthis.base.comuni = _.chain(this.raw)\n\t\t\t\t.filter({ sigla: p })\n\t\t\t\t.orderBy('nome')\n\t\t\t\t.map(function (c) {\n\t\t\t\t\treturn {\n\t\t\t\t\t\tvalue: c.nome,\n\t\t\t\t\t\ttext: c.nome\n\t\t\t\t\t};\n\t\t\t\t})\n\t\t\t\t.value();\n\n\t\t\tif (this.indirizzo.comune) {\n\t\t\t\tthis.getCap(this.indirizzo.comune);\n\t\t\t}\n\t\t},\n\n\t\tgetCap(c) {\n\t\t\t// console.log('getCap', c);\n\n\t\t\tvar citta = _.chain(this.raw).filter({ nome: c }).head().value();\n\n\t\t\tthis.base.cap = _.map(citta.cap, function (zip) {\n\t\t\t\treturn {\n\t\t\t\t\tvalue: zip,\n\t\t\t\t\ttext: zip,\n\t\t\t\t};\n\t\t\t});\n\n\t\t\tif (this.base.cap.length == 1) {\n\t\t\t\tthis.indirizzo.cap = _.head(this.base.cap).value;\n\t\t\t}\n\t\t},\n\t},\n\n\tmounted() {\n\t\tthis.getRaw();\n\t},\n};\n</script>\n\n<style lang=\"scss\" scoped>\n.vue-cap{\n    .vue-cap-item {\n        label, select{\n            display: block;\n            width: 100%;\n        }\n    }\n}\n</style>\n",".vue-cap .vue-cap-item label, .vue-cap .vue-cap-item select {\n  display: block;\n  width: 100%;\n}\n\n/*# sourceMappingURL=vue-cap.vue.map */"]}, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__ = "data-v-82ebed0a";
  /* module identifier */
  var __vue_module_identifier__ = undefined;
  /* functional template */
  var __vue_is_functional_template__ = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__ = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    false,
    createInjector,
    undefined,
    undefined
  );

// Import vue component

// Declare install function executed by Vue.use()
function install(Vue) {
	if (install.installed) { return; }
	install.installed = true;
	Vue.component('VueCap', __vue_component__);
}

// Create module definition for Vue.use()
var plugin = {
	install: install,
};

// Auto-install when vue is found (eg. in browser via <script> tag)
var GlobalVue = null;
if (typeof window !== 'undefined') {
	GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
	GlobalVue = global.Vue;
}
if (GlobalVue) {
	GlobalVue.use(plugin);
}

export default __vue_component__;
export { install };
