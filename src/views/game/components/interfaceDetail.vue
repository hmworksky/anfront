<template>
  <div class="tab-container">
    <el-tag>mounted times ：{{ createdTimes }}</el-tag>
    <el-alert :closable="false" style="width:200px;display:inline-block;vertical-align: middle;margin-left:30px;" title="Tab with keep-alive" type="success"/>
    <el-tabs v-model="activeName" style="margin-top:15px;" type="border-card">
      <el-tab-pane v-for="item in tabMapOptions" :label="item.label" :key="item.key" :name="item.key">
        <!--<keep-alive>-->
          <!--<tab-pane v-if="activeName==item.key" :type="item.key" @create="showCreatedTimes"/>-->
        <!--</keep-alive>-->
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import tabPane from '@/views/tab/components/tabPane'

export default {
  name: 'InterfaceDetail',
  components: { tabPane },
  data() {
    return {
      tabMapOptions: [
        { label: '字段详情', key: 'CN' },
        { label: '请求头', key: 'US' },
        { label: '参数构造', key: 'JP' },
        { label: 'Eurozone', key: 'EU' }
      ],
      activeName: 'CN',
      createdTimes: 0
    }
  },
  methods: {
    showCreatedTimes() {
      this.createdTimes = this.createdTimes + 1
    }
  }
}
</script>

<style scoped>
  .tab-container{
    margin: 30px;
  }
</style>

