<template>
  <div>
    <el-button type="primary" @click="importPaper()">导入试卷</el-button>
  </div>
</template>

<script>
  import axios from 'axios'
  import {remote} from 'electron'
  export default {
    name: 'export-paper',
    computed: {
      jsonArr() {
        this.arr = this.$store.state.jsonArr
        return this.$store.state.jsonArr
      },
      num() {
        return this.$store.state.main
      }
    },
    data() {
      return {
        arr: []
      }
    },
    methods: {
      importPaper() {
        remote.dialog.showOpenDialog({
          title: '选择需要导入的.docx格式的word试卷！',
          properties: ['openFile', 'multiSelections'],
          filters: [
            {
              name: 'word', extensions: ['docx']
            }
          ]
        }, (filePaths) => {
          console.log(filePaths);
          if (filePaths) {
            axios.post('http://localhost:3003/word-to-json', {
              docxList: filePaths
            })
              .then((response) => {
                console.log(response)
                alert(response.data.jsonArr.length)
                this.$store.dispatch('CHANGE_jSON_ARR',
                  {
                    jsonArr: response.data.jsonArr
                  }
                )
              })
              .catch((err) => {
                console.log(err)
              })
          }
        })
      }
    }
  }
</script>

<style scoped>

</style>