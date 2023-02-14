<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <h5>{{ directory?.name }}</h5>
        <h6>Setting</h6>
        <TabView>
          <TabPanel header="Authentication">
            <div class="grid">
              <div class="col-3">
                <div class="card border-round">
                  <div style="height: 100%; flex-direction: column;">
                    <div style="margin-left: -10px;">
                      Unconfigured
                    </div>
                    <h5>{{ directory?.Provider?.name }}</h5>
                    <hr>
                    <dl>
                      <div class="grid protocol">
                        <div class="col-12">
                          <p class="protocol-label">
                            Protocol
                          </p>
                          <p>{{ directory?.Provider?.protocol }}</p>
                        </div>
                        <div class="col-6">
                          <p class="protocol-label">
                            CERTIFICATE TYPE
                          </p>
                          <p>{{ directory?.Provider?.certificate_type }}</p>
                        </div>
                        <div class="col-6">
                          <p class="protocol-label">
                            CREATED AT
                          </p>
                          <p>{{ dateFormat(directory?.Provider?.created_at) }}</p>
                        </div>
                      </div>
                    </dl>
                    <!-- <div class="flex justify-content-end">
                        <Button type="button" data-testid="edit-button" style="ml-auto">Configure</Button>
                      </div> -->
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>
          <TabPanel header="Domain">
            <div v-if="directory?.Domain">
              <div class="card">
                {{ directory?.Domain?.name }}
              </div>
            </div>
            <div
              v-else
              class="text-center"
            >
              <h4>Add Domain</h4>
              <p>Import verified domains from Azure AD or input them manually<br> and verify them through DNS token.</p>
              <Button
                label="Add Domain"
                class=""
                @click="visible = true"
              />
            </div>
          </TabPanel>
        </TabView>
      </div>
    </div>

    <Dialog
      v-model:visible="visible"
      header="Add Domain"
      :breakpoints="{ '960px': '75vw', '640px': '100vw' }"
      :style="{ width: '50vw' }"
    >
      <div class="p-fluid">
        <FormWizard
          ref="wizard"
          color="rgba(var(--vs-primary), 1)"
          :title="null"
          :hide-buttons="true"
          :icon="false"
          :subtitle="null"
          enctype="multipart/form-data"
        >
          <tab-content
            title="Personal details"
            icon="ti-user"
          >
            <form @submit.prevent="changeTab">
              <p>Select the method you want to use to add domains.</p>
              <div class="grid items-stretch flex">
                <input
                  id="microsoft_azure"
                  v-model="domain"
                  class="d-none"
                  type="radio"
                  value="Microsoft Azure"
                >
                <label
                  class="col-3 mt-5"
                  for="microsoft_azure"
                >
                  <div
                    class="card cursor-pointer border-round directory-id h-full"
                    :class="{'active': domain==='Microsoft Azure'}"
                  >
                    <div class="card-content">
                      <div class="card-button-body ">
                        <i class=" pi pi-microsoft" />
                        <h6> Add domains from Microsoft Azure Active Directory </h6>
                        <span class="type-info card-description">
                          Select this option if you want to import verified domains from
                          Microsoft Azure Active Directory
                        </span>
                      </div>
                    </div>
                  </div>
                </label>
                <input
                  id="google"
                  v-model="domain"
                  type="radio"
                  value="Google"
                  class="d-none"
                >
                <label
                  class="col-3 mt-5"
                  for="google"
                >
                  <div
                    class="card cursor-pointer border-round directory-id h-full"
                    :class="{'active': domain==='Google'}"
                  >
                    <div class="card-content">
                      <div class="card-button-body ">
                        <i class="pi pi-google" />
                        <h6> Add domains from Google </h6>
                        <span class="type-info card-description">
                          Select this option if you want to import verified domains from Google Workspace
                        </span>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
              <div class="">
                <Button
                  :disabled="!domain"
                  :label="domain?`Login With ${domain}`:'Next'"
                  class="flex ml-auto w-10rem"
                  type="submit"
                />
              </div>
            </form>
          </tab-content>
          <tab-content
            title="Personal details"
            icon="ti-user"
          >
            <form @submit.prevent="submitted">
              <div class="card">
                <h5>Select your domain</h5>
                <hr>
                <p>Select the identity provider that your organization uses to authenticate users.</p>
                <DataTable
                  v-model:selection="selectedDomain"
                  :value="allDomain"
                  :removable-sort="true"
                >
                  <Column
                    selection-mode="single"
                    header-style="width: 3rem"
                  />
                  <Column
                    sortable
                    field="name"
                    header="Domain"
                  />
                  <Column
                    sortable
                    field="status"
                    header="Status"
                  >
                    <template #body="{ data }">
                      {{ data.status.replaceAll('-', ' ') }}
                    </template>
                  </Column>
                </DataTable>
                <div class="flex ml-auto mt-4">
                  <Button
                    label="Back"
                    class="w-6rem"
                    @click="goToBack"
                  />
                  <Button
                    :disabled="selectedDomain?.length === 0"
                    label="Submit"
                    class="flex ml-auto w-6rem"
                    type="submit"
                  />
                </div>
              </div>
            </form>
          </tab-content>
        </FormWizard>
      </div>
    </Dialog>
  </div>
</template>

<script>
import { defineComponent, computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import { FormWizard, TabContent } from 'vue3-form-wizard';
// eslint-disable-next-line import/no-unresolved
import { useToastService } from '@/composables/useToast.mjs';
import 'vue3-form-wizard/dist/style.css';

export default defineComponent({
  components: {
    FormWizard, TabContent,
  },
  setup() {
    const { getters, dispatch } = useStore();
    const { params } = useRoute();
    const domain = ref(null);
    const visible = ref(false);
    const selectedDomain = ref([]);
    const { showToast } = useToastService();
    const wizard = ref(null);
    onMounted(async () => {
      await dispatch('getDirectoryById', params.id);
      await dispatch('getAllDomain');
    });
    const directory = computed(() => getters.directoryById);
    const allDomain = computed(() => getters.domains);

    const changeTab = () => {
      wizard.value.nextTab();
    };

    const goToBack = () => {
      wizard.value.prevTab();
    };

    const submitted = async () => {
      try {
        await dispatch('updateDirectory', {
          ...params,
          body: { domain_id: selectedDomain.value.id },
        });
        showToast({ detail: 'Directory domain updated successfully' });
        await dispatch('getDirectoryById', params.id);
        visible.value = false;
        domain.value = null;
        selectedDomain.value = null;
      } catch (error) {
        console.log(error);
      }
    };

    const dateFormat = date => new Date(date).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    return {
      directory,
      domain,
      visible,
      changeTab,
      goToBack,
      wizard,
      allDomain,
      selectedDomain,
      submitted,
      dateFormat,
    };
  },
});
</script>

<style scoped>
.protocol{
  font-size:12px
}
.protocol-label{
  color:#8e8e8e;
}
</style>
