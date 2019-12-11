<template>
    <div id='.userFilter'>

    </div>
</template>

<script>
export default {
    name: 'UserFilter',
    props: {
        // Dataset
    },
    data: function () {
        return {
        count: 0
        }
    },
    template: '<button v-on:click="count++">Vous m\'avez cliqué {{ count }} fois.</button>'
}
</script>
