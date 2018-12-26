<template>
  <div>
    <div class="title">Information</div>
    <div class="items">
      <div class="item">
        <div class="name">Path:</div>
        <div class="value">{{ path }}</div>
      </div>
      <div class="item">
        <div class="name">Route Name:</div>
        <div class="value">{{ name }}</div>
      </div>
      <div class="item">
        <div class="name">Vue.js:</div>
        <div class="value">{{ vue }}</div>
      </div>
      <div class="item">
        <div class="name">Electron:</div>
        <div class="value">{{ electron }}</div>
      </div>
      <div class="item">
        <div class="name">Node:</div>
        <div class="value">{{ node }}</div>
      </div>
      <el-table
        :data="jsonArr"
        stripe
        style="width: 100%">
        <el-table-column
          prop="试卷名称"
          label="Tatle"
          width="180">
        </el-table-column>
        <el-table-column
          prop="试卷属性"
          label="Attribute"
          width="180">
        </el-table-column>
        <el-table-column
          prop="学段学科"
          label="Subject">
        </el-table-column>
      </el-table>
      <p>{{num}}</p>
      <div class="item">
        <div class="name">Platform:</div>
        <div class="value">{{ platform }}</div>
      </div>
      <div>
        <el-button type="primary" @click="getData()">主要按钮</el-button>
      </div>
      <importPaper></importPaper>
    </div>
  </div>
</template>

<script>
  import importPaper from '@/components/import.vue'
  export default {
    computed: {
      jsonArr() {
        return this.$store.state.jsonArr
      },
      num() {
        return this.$store.state.main
      }
    },
    methods: {
      getData() {
        /*this.$store.commit('CHANGE_jSON_OBJ', {jsonArr: [{
          Tatle: 'adasdsad',
          Attribute: 'zczvzvzx',
          Subject: '124131312'
        }]})*/
        this.$store.dispatch('someAsyncTask')
      }
    },
    components: {
      importPaper
    },
    data () {
      return {
        electron: process.versions.electron,
        name: this.$route.name,
        node: process.versions.node,
        path: this.$route.path,
        platform: require('os').platform(),
        vue: require('vue/package.json').version
      }
    }
  }
</script>

<style scoped>
  .title {
    color: #888;
    font-size: 18px;
    font-weight: initial;
    letter-spacing: .25px;
    margin-top: 10px;
  }

  .items { margin-top: 8px; }

  .item {
    display: flex;
    margin-bottom: 6px;
  }

  .item .name {
    color: #6a6a6a;
    margin-right: 6px;
  }

  .item .value {
    color: #35495e;
    font-weight: bold;
  }
</style>
