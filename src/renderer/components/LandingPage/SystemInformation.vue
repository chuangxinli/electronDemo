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
          type="index"
          width="50">
        </el-table-column>
        <el-table-column
          prop="Tatle"
          label="试卷名称"
          width="180">
        </el-table-column>
        <el-table-column
          prop="Attribute"
          label="试卷属性"
          width="180">
        </el-table-column>
        <el-table-column
          prop="Subject"
          label="学段学科">
        </el-table-column>
      </el-table>
      <p>数量：{{num}}</p>
      <div class="item">
        <div class="name">Platform:</div>
        <div class="value">{{ platform }}</div>
      </div>
      <div>
        <el-button type="primary" @click="INCREMENT_MAIN_COUNTER({num: 5})">+</el-button>
        <el-button type="primary" @click="DECREMENT_MAIN_COUNTER({num: 20})">-</el-button>
        <el-button type="primary" @click="changeData()">改变数据</el-button>
        <el-button type="primary" @click="upload()">上传一个</el-button>
        <el-button type="primary" @click="goList()">goList</el-button>
      </div>
      <importPaper></importPaper>
    </div>
  </div>
</template>

<script>
  import {mapActions} from 'vuex'
  import importPaper from '@/components/import.vue'
  export default {
    computed: {
      jsonArr() {
        return this.$store.state.Counter.jsonArr
      },
      num() {
        return this.$store.state.Counter.num
      }
    },
    methods: {
      ...mapActions(['INCREMENT_MAIN_COUNTER', 'DECREMENT_MAIN_COUNTER']),
      changeData() {
        this.arr.push({
          Tatle: new Date().getTime(),
          Attribute: 'weqeqweqweq',
          Subject: 'adadasdsdas'
        })
        this.$store.dispatch('INCREMENT_MAIN_COUNTER')
        this.$store.dispatch('CHANGE_jSON_ARR',
          {
            jsonArr: this.arr
          }
        )
      },
      upload(){
        this.$store.dispatch('DELETE_ONE_PAPER',{
          localId: 1545899249017
        })
      },
      goList() {
        this.$router.push({
          path: '/List'
        })
      }
    },
    mounted(){
      console.log(this.main)
      console.log(this.jsonArr)
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
        vue: require('vue/package.json').version,
        arr: []
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

  .items {
    margin-top: 8px;
  }

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
