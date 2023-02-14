<template>
  <div class="grid">
    <Toast />
    <div class="col-12">
      <div class="card">
        <h5>Organizations / Accounts</h5>
        <Button
          type="button"
          icon="pi pi-fw pi-plus"
          label="New Sub-Account"
          class="p-button mb-2 mr-3 e2e-new-sub-account"
          @click="openAddorg"
        />
        <Tree
          v-if="childOrgs.length > 0"
          :value="childOrgs"
          selection-mode="single"
          class="custom-tree"
        >
          <template #default="childOrg">
            <div
              style="width: 100%; display: flex; align-items: center"
              class="w-full d-flex"
            >
              <b>{{ childOrg.node.label }}</b>
              <div class="ml-auto">
                <Button
                  v-tooltip.bottom="childOrg.node.manual ? ' Re-Upload Product Manual' :'Upload Product Manual '"
                  type="button"
                  icon="pi pi-fw pi-file-pdf"
                  label=""
                  class="p-button mr-3 my-1"
                  @click="showUploadManual(childOrg.node)"
                />

                <Button
                  type="button"
                  icon="pi pi-fw pi-pencil"
                  label=""
                  class="p-button mr-3 my-1"
                  @click="showEditOrg(childOrg.node)"
                />
                <Button
                  v-if="organizationId !== childOrg.node.key && permissions"
                  type="button"
                  icon="pi pi-fw pi-trash"
                  label=""
                  class="p-button mr-3 my-1"
                  @click="openConfirmation(childOrg.node)"
                />
              </div>
            </div>
          </template>
        </Tree>
      </div>
    </div>

    <Dialog
      v-model:visible="showAddorg"
      header="Add an Account / Organization"
      :breakpoints="{ '960px': '75vw', '640px': '100vw' }"
      :style="{ width: '50vw' }"
    >
      <Dropdown
        id="dropdown"
        v-model="parent_org_id"
        :options="orgs"
        option-label="name"
        class="my-2 e2e-select-parent-account"
        option-value="value"
        style="width: 100%"
        placeholder="Select parent Account"
      />
      <small
        v-if="v$.parent_org_id.$error"
        class="p-error"
      >{{
        v$.parent_org_id.$errors[0].$message
      }}</small>

      <InputText
        v-model="organization"
        type="text"
        class="mb-2 e2e-account-name"
        placeholder="Account name"
        style="width: 100%"
      />
      <p class="mb-2">
        <small
          v-if="v$.organization.$error"
          class="p-error"
        >{{
          v$.organization.$errors[0].$message
        }}</small>
      </p>

      <input
        ref="update_avatar_input"
        type="file"
        accept=".png,.jpg,.jpeg"
        class="d-none"
        style="width: 100%"
        @change="getFileHandler"
      >
      <Button
        label="Upload Logo"
        icon="pi pi-upload"
        class="p-button"
        @click="$refs.update_avatar_input.click()"
      />
      <img
        id="fileupload"
        :src="profile_image"
        class="h-3rem ml-5"
        alt=""
      >

      <template #footer>
        <Button
          label="Cancel"
          icon="pi pi-times"
          class="p-button-text"
          @click="closeAddorg"
        />
        <Button
          label="Proceed"
          icon="pi pi-check"
          class="e2e-submit-proceed"
          autofocus
          @click="AddOrg"
        />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="openEditOrg"
      header="Edit Account"
      :breakpoints="{ '960px': '75vw', '640px': '100vw' }"
      :style="{ width: '50vw' }"
    >
      <InputText
        v-model="Editorganization"
        type="text"
        class="mb-2 e2e-edit-account"
        placeholder="Edit Account"
        style="width: 100%"
      />
      <small
        v-if="editerror"
        class="p-error"
      >{{ editerror }}</small>

      <template #footer>
        <Button
          label="Cancel"
          icon="pi pi-times"
          class="p-button-text"
          @click="closeEditorg"
        />
        <Button
          label="Update"
          icon="pi pi-check"
          class="e2e-update"
          autofocus
          @click="EditOrg"
        />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="openUploadManual"
      header="Upload Manual"
      :breakpoints="{ '960px': '75vw', '640px': '100vw' }"
      :style="{ width: '50vw' }"
    >
      <FileUpload
        ref="file-uploader"
        name="file"
        :custom-upload="true"
        :multiple="false"
        accept=".pdf"
        @uploader="UploadManual"
        @select="getUploadManualHandler"
      >
        <template #content>
          <ul v-if="uploadedFiles && uploadedFiles[0]">
            <li v-for="file of uploadedFiles[0]" :key="file">{{ file.name }} - {{ file.size }} bytes</li>
          </ul>
        </template>
        <template #empty>
          <p>Drag and drop files to here to upload.</p>
        </template>
      </FileUpload>
    </Dialog>

    <Dialog
      v-model:visible="displayConfirmation"
      header="Confirmation"
      :style="{ width: '350px' }"
      :modal="true"
    >
      <div class="flex align-items-center justify-content-center">
        <i
          class="pi pi-exclamation-triangle mr-3"
          style="font-size: 2rem"
        />
        <span>Are you sure you want to delete this account? This is irreversible</span>
      </div>
      <template #footer>
        <Button
          label="No"
          icon="pi pi-times"
          class="p-button-text"
          @click="closeConfirmation"
        />
        <Button
          label="Yes"
          icon="pi pi-check"
          class="p-button-text e2e-deleteorg"
          autofocus
          @click="deleteOrg"
        />
      </template>
    </Dialog>
  </div>
</template>

<script>
import {
  computed,
  defineComponent,
  onMounted,
  ref,
  reactive,
  toRefs,
} from 'vue';
import { useStore } from 'vuex';
import { useToast } from 'primevue/usetoast';
import { useVuelidate } from '@vuelidate/core';
import { organization } from '../validation/organization.mjs';

export default defineComponent({
  name: 'Orgs',
  setup() {
    const state = reactive({
      organization: '',
      file: '',
      parent_org_id: '',
      profile_image: '',
      manual_name: '',
    });
    const values = reactive({
      Editorganization: '',
      id: '',
    });
    const manualValues = reactive({
      id: '',
      file: [],
    });
    const editerror = computed(() => (values.Editorganization === ''
      ? 'Account name is required'
      : ''));
    const deleteid = ref('');
    const openEditOrg = ref(false);
    const openUploadManual = ref(false);
    const displayConfirmation = ref(false);
    const rules = computed(() => organization);
    const v$ = useVuelidate(rules, state);
    const selectedKey1 = ref(null);
    const { dispatch, getters } = useStore();
    // eslint-disable-next-line no-unused-vars
    const toast = useToast();
    const showAddorg = ref(false);
    const organizationId = computed(() => getters.organizationId);
    const roleId = computed(() => getters.roleId);
    const uploadedFiles = ref([]);
    onMounted(
      async () => {
        await dispatch('getChildOrgs', { id: organizationId.value });
        if (roleId.value) { await dispatch('getPermissionByRoleId', { roleId: roleId.value }); }
      },
    );
    const getPermissionByRoleId = computed(() => getters.RoleByPermission);
    const childOrgs = computed(() => getters.childOrgs);
    const permissions = computed(() => {
      if (roleId.value === null) { return true; }

      return getPermissionByRoleId.value.some(el => el.name.toLowerCase() === 'Create/Delete/Rename Accounts'.toLowerCase());
    });

    const openConfirmation = async data => {
      deleteid.value = data.key;
      displayConfirmation.value = true;
    };

    const closeConfirmation = async () => {
      displayConfirmation.value = false;
    };
    const getChildOrgs = async () => {
      await dispatch('getChildOrgs', { id: organizationId.value });
    };

    const deleteOrg = async () => {
      try {
        if (deleteid.value !== '') {
          await dispatch('deleteOrganization', { id: deleteid.value });
          getChildOrgs();
          closeConfirmation();
        }
      } catch (error) {
        console.log(error);
      }
    };

    const orgs = computed(() => getters.flatOrgs);

    const closeAddorg = () => {
      showAddorg.value = false;
    };

    const openAddorg = () => {
      state.organization = '';
      state.file = '';
      state.parent_org_id = '';
      state.profile_image = '';
      v$.value.$reset();
      if (orgs.value.length === 1) {
        state.parent_org_id = orgs.value[0].value;
      }
      showAddorg.value = true;
    };

    const AddOrg = async () => {
      try {
        v$.value.$validate();
        if (!v$.value.$error) {
          const data = new FormData();
          data.append('file', state.file);
          data.append('parent_org_id', state.parent_org_id);
          data.append('name', state.organization);
          await dispatch('addOrganization', data);
          getChildOrgs();
          closeAddorg();
        }
      } catch (error) {
        console.log(error);
      }
    };

    const getFileHandler = async e => {
      state.profile_image = URL.createObjectURL(e.target.files[0]);
      if (e.target.files.length) {
        [state.file] = e.target.files;
      }
    };

    const getUploadManualHandler = async event => {
      if (event.files.length > 1) {
        event.files.splice(0, 1);
      }
    };

    const optionValue = async Options => Options;

    const showEditOrg = async data => {
      openEditOrg.value = true;
      values.Editorganization = data.label;
      values.id = data.key;
    };

    const showUploadManual = async data => {
      openUploadManual.value = true;
      manualValues.id = data.key;
    };

    const closeEditorg = async () => {
      openEditOrg.value = false;
    };
    const EditOrg = async () => {
      try {
        if (values.Editorganization !== '') {
          await dispatch('editOrganization', {
            id: values.id,
            name: values.Editorganization,
          });
          getChildOrgs();
          closeEditorg();
        }
      } catch (error) {
        console.log(error);
      }
    };
    const closeUploadManual = async () => {
      openUploadManual.value = false;
    };

    const UploadManual = async event => {
      try {
        const file = event.files[0];
        const data = new FormData();
        data.append('file', file);
        data.append('id', manualValues.id);
        await dispatch('uploadManual', data);
        if (manualValues.id === organizationId.value) {
          await dispatch('getOrganization', organizationId.value);
        }
        await dispatch('getChildOrgs', { id: organizationId.value });
        closeUploadManual();
      } catch (error) {
        console.log(error);
      }

      // try {
      //   if (manualValues.file) {
      //     const data = new FormData();
      //     data.append('file', manualValues.file);
      //     data.append('id', manualValues.id);
      //     await dispatch('uploadManual', data);
      //     manualValues.file = [];
      //     state.manual_name = '';
      //     // getChildOrgs();
      //     console.log(manualValues.id, organizationId.value);
      //     if (manualValues.id === organizationId.value) {
      //       await dispatch('getOrganization', organizationId.value);
      //     }
      //     await dispatch('getChildOrgs', { id: organizationId.value });
      //     closeUploadManual();
      //   }
      // } catch (error) {
      //   console.log(error);
      // }
    };

    return {
      ...toRefs(state),
      ...toRefs(values),
      organizationId,
      selectedKey1,
      childOrgs,
      showAddorg,
      closeAddorg,
      openAddorg,
      AddOrg,
      orgs,
      getFileHandler,
      getUploadManualHandler,
      optionValue,
      v$,
      showEditOrg,
      showUploadManual,
      openEditOrg,
      openUploadManual,
      EditOrg,
      UploadManual,
      closeEditorg,
      closeUploadManual,
      editerror,
      displayConfirmation,
      openConfirmation,
      closeConfirmation,
      deleteOrg,
      permissions,
      uploadedFiles,
    };
  },
});
</script>

<style lang="scss">
.custom-tree {
   .p-treenode-label {
      width: 100%;
   }
}
.manual-upload {
   vertical-align: super;
   padding: 10px;
}

.p-fileupload-row > div:first-child {
    display: none;
}
</style>
