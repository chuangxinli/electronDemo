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
        data() {
            return {

            }
        },
        methods: {
            importPaper() {
                remote.dialog.showOpenDialog({
                    title: '选择需要导入的.docx试卷',
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