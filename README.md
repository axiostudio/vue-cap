# Vue CAP

**VueCap** è un semplice componente che permette di selezionare il CAP (Codice Avviamento Postale) di un comune italiano selezionando prima quindi la provincia, poi il comune e quindi uno dei CAP a disposizione.

Si ringrazia Matteo Contrini per il suo magnifico lavoro su https://github.com/matteocontrini/comuni-json su cui è basato questo progetto.

> 🇬🇧 
> 
> This project is dedicated to the italian community.

## Installatione

```shell
# npm
$ npm install vue-cap

# yarn
$ yarn add vue-cap
```

## Implementazione

Eccome come puoi semplicemente usare il componente nel tuo progetto Vue:

```vue
<template>
    <VueCap :indirizzo="indirizzo" />
</template>

<script>
import Vue from 'vue'
import VueCap from 'vue-cap'

export default {
    name: 'MyComponent',

    components: {
        VueCap
    },

    data(){
        return {
            indirizzo: {
                provincia: '',
                comune: '',
                cap: ''
            }
        }
    }
}
</script>
```

## Segnalazioni report

Se trovi un bug, hai richieste o vuoi segnalare qualcosa, per favore, fallo su https://github.com/axiostudio/vue-cap/issues
