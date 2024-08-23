<template>
	<div class="vue-cap">

		<template v-if="raw">

            <div class="vue-cap-item">
                <label for="vue-cap-provincia">Provincia</label>
                <select name="provincia" id="vue-cap-provincia" v-model="indirizzo.provincia">
                    <option value=""></option>
                    <option v-for="p in base.province" :key="p.value" :value="p.value">{{ p.text }}</option>
                </select>
            </div>

            <div class="vue-cap-item">
                <label for="vue-cap-comune">Comune</label>
                <select name="comune" id="vue-cap-comune" v-model="indirizzo.comune" :disabled="indirizzo.provincia == ''">
                    <option value=""></option>
                    <option v-for="c in base.comuni" :key="c.value" :value="c.value">{{ c.text }}</option>
                </select>
            </div>

            <div class="vue-cap-item">
                <label for="vue-cap-cap">CAP</label>                
                <select name="cap" id="vue-cap-cap" v-model="indirizzo.cap" :disabled="indirizzo.comune == ''">
                    <option value=""></option>
                    <option v-for="z in base.cap" :key="z.value" :value="z.value">{{ z.text }}</option>
                </select>
            </div>
            
		</template>
        <div v-else>
			Loading...
		</div>

	</div>
</template>

<script>
import axios from 'axios';
import _ from 'lodash';

export default {
	name: 'VueCap',

	props: {
        indirizzo: {
			type: Object,
			default: () => {
                return {
                    provincia: '',
                    comune: '',
                    cap: ''
                }
            }
		}
	},

	data() {
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
            console.log('indirizzo.provincia', p);

			if (p) {
				this.indirizzo.comune = '';
				this.indirizzo.cap = '';
				this.getComuni(p);
			}
		},

		'indirizzo.comune': function (c) {
            console.log('indirizzo.comune', c);

			if (c) {
				this.indirizzo.cap = '';
				this.getCap(c);
			}
		},
	},

	methods: {
		getRaw: function () {
			axios.get('https://raw.githubusercontent.com/matteocontrini/comuni-json/master/comuni.json')
            .then(({ data }) => {
                this.raw = data;
                this.getProvince();
            })
            .catch((error) => {
                alert(error.response.data);
            });
		},

		getProvince() {
			console.log('getProvince');

			this.base.province = _.chain(this.raw)
				.orderBy('sigla')
				.map((city) => {
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

		getComuni(p) {
			console.log('getComuni', p);

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

		getCap(c) {
			console.log('getCap', c);

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

	mounted() {
		this.getRaw();
	},
};
</script>
