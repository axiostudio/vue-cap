<template>
    <div>
    
        <VueCap :indirizzo="indirizzo" />

        <pre>{{ indirizzo }}</pre>

    </div>
</template>

<script>
import VueCap from '../lib/VueCap.vue';

export default {
    name: 'App',

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
};
</script>