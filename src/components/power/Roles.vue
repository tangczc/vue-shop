<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区-->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogRoleVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="rolelist" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- el-row 一共24列 -->
            <el-row :class="['bdbottom', i1 === 0 ? 'bdtop':'','vcenter']" v-for="( item1, i1 ) in scope.row.children"
                    :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环渲染2级权限 -->
                <el-row v-for="( item2, i2 ) in item1.children" :key="item2.id"
                        :class="[ i2 === 0 ? '': 'bdtop','vcenter']">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">{{
                        item2.authName
                      }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="13">
                    <el-tag v-for="(item3) in item2.children" :key="item3.id" type="warning" closable
                            @close="removeRightById(scope.row,item3.id)">
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="编辑" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" circle size="min"
                         @click="showModifyDialog(scope.row.id)"></el-button>
            </el-tooltip>
            <!-- 删除 -->
            <el-tooltip effect="dark" content="删除角色" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" circle size="min"
                         @click="removeRoleByRoleId(scope.row.id)"></el-button>
            </el-tooltip>
            <!-- 分配角色 -->
            <el-tooltip effect="dark" content="分配权限" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" circle size="min"
                         @click="showSetRightDialog(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addDialogRoleVisible"
      width="50%"
      @close="addRoleDialogClose">
      <!-- 表单主体区域 -->
      <span>
        <el-form :model="addRoleForm" class="addRoleForm" label-width="100px" ref="addRoleFormRef"
                 :rules="addRoleFormRules">
          <el-form-item label="角色名" prop="roleName">
            <el-input v-model="addRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述">
            <el-input v-model="addRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <!-- 按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogRoleVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改角色对话框 -->
    <el-dialog
      title="修改角色信息"
      :visible.sync="modifyDialogRoleVisible"
      width="50%"
      @close="modifyRoleDialogClose">
      <span>
        <el-form :model="modifyRoleForm" class="modifyRoleForm" :rules="modifyRoleFormRules" ref="modifyRoleRef"
                 label-width="100px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="modifyRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述">
            <el-input v-model="modifyRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <!-- 按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click=" modifyDialogRoleVisible = false">取 消</el-button>
        <el-button type="primary" @click="modifyRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="showSetRightDialogVisible"
      width="50%"
      @close="defKeys=[]">
      <!-- 树形组件 -->
      <el-tree :data="rightsLists" :props="treeProps" show-checkbox node-key="id" default-expand-all
               :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showSetRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 所有角色列表数据
      rolelist: [],
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色表单验证规则
      addRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色民' }
        ]
      },
      // 控制添加角色对话框显示与隐藏
      addDialogRoleVisible: false,
      // 控制修改角色对话框显示与隐藏
      modifyDialogRoleVisible: false,
      // 控制分配权限显示与隐藏对话框
      showSetRightDialogVisible: false,
      // 修改角色表单对象
      modifyRoleForm: {},
      // 所有权限数据对象
      rightsLists: [],
      // 修改角色表单验证规则
      modifyRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色民' }
        ]
      },
      // 树形绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中节点的id值
      defKeys: [],
      // 角色id
      roleId: ''
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('角色列表获取失败')
      this.rolelist = res.data
    },
    // 点击关闭确定取消重置添加角色对话框
    addRoleDialogClose () {
      this.$refs.addRoleFormRef.resetFields()
    },
    // 添加角色
    addRole () {
      this.$refs.addRoleFormRef.validate(async valid => {
        // 发起表单预校验
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        if (res.meta.status !== 201) return this.$message.error('添加角色失败')
        // 返回添加成信息
        this.$message.success('添加角色成功')
        // 关闭对话框
        this.addDialogRoleVisible = false
        // 更新角色列表
        await this.getRolesList()
      })
    },
    // 展示角色对话框
    async showModifyDialog (id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('获取角色信息失败')
      this.modifyRoleForm = res.data
      this.modifyDialogRoleVisible = true
    },
    // 修改角色
    modifyRole () {
      this.$refs.modifyRoleRef.validate(async valid => {
        // 发起表单请求之前的预校验
        if (!valid) return
        // 发起网络请求
        const { data: res } = await this.$http.put('roles/' + this.modifyRoleForm.roleId, {
          roleName: this.modifyRoleForm.roleName,
          roleDesc: this.modifyRoleForm.roleDesc
        })
        if (res.meta.status !== 200) return this.$message.error('修改角色信息失败')
        // 更新角色列表
        await this.getRolesList()
        // 关闭修改角色窗口
        this.modifyDialogRoleVisible = false
        // 提示信息
        this.$message.success('修改角色信息成功')
      })
    },
    modifyRoleDialogClose () {
      this.$refs.modifyRoleRef.resetFields()
    },
    // 根据roleId删除角色
    async removeRoleByRoleId (id) {
      const confirmResult = await this.$confirm('是否永久删除该角色', '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'waring'
      }).catch(err => err)
      // 如果用户点击确认删除，则返回字符串confirm
      // 如果用户取消删除, 则返回值为字符串 cancel
      if (confirmResult !== 'confirm') return this.$message.info('取消删除')
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除角色失败')
      // 提示信息
      this.$message.success('删除角色成功')
      // 更新角色列表
      await this.getRolesList()
    },
    // 根据id删除权限
    async removeRightById (role, rightId) {
      const confirmResult = await this.$confirm('此操作将永久删除该权限，是否继续?', '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 如果用户点击确认删除，则返回字符串confirm
      // 如果用户取消删除, 则返回值为字符串 cancel
      if (confirmResult !== 'confirm') return this.$message.info('取消删除')
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) return this.$message.error('删除权限失败')
      role.children = res.data
      this.$message.success('删除成功')
    },
    // 展示分配权限对话框
    async showSetRightDialog (role) {
      this.roleId = role.id
      // 获取所有权限数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败')
      // 把获取权限的数据保存到rightsLists中
      this.rightsLists = res.data
      this.getLeafKeys(role, this.defKeys)
      this.showSetRightDialogVisible = true
    },
    // 通过递归获取角色三级权限id保存到数组中
    getLeafKeys (node, arr) {
      // 如果当前node节点不包含children则是三级节点
      if (!node.children) return arr.push(node.id)
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 点击为角色分配权限
    async allotRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success('分配权限成功')
      await this.getRolesList()
      this.showSetRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.addRoleForm {
  .el-input {
    width: 90%;
  }
}

.modifyRoleForm {
  .el-input {
    width: 90%;
  }
}

.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eeeeee;
}

.bdbottom {
  border-bottom: 1px solid #eeeeee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
