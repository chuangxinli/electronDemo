<template>
    <div>
        <Header></Header>
        <div class="main">
            <Aside></Aside>
            <div class="view">
                <router-view></router-view>
                <Footer></Footer>
            </div>
        </div>
    </div>
</template>

<script>
    import Header from './Header.vue'
    import Aside from './Aside.vue'
    import Footer from './Footer.vue'
    export default {
        data() {
            return {
                getHeight: {}
            }
        },
        mounted(){
        },
        components: {
            Header,
            Aside,
            Footer
        }
    }
</script>

<style scoped>
    .main{
        height: 100%;
    }
    .view{
        position: relative;
        padding: 80px 20px 80px 220px;
        height: 100%;
        min-height: 660px;
    }
</style>