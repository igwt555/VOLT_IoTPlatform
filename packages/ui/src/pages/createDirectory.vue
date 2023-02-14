<template>
  <div class="grid">
    <div class="col-12">
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
            <div class="card">
              <h5>Create A Directory</h5>
              <hr>
              <p>Create a directory by naming it and selecting whether to use Federated ID or Enterprise ID authentication.</p>
              <InputText
                id="directoryName"
                v-model="directoryName"
                class="w-100"
                name="name"
                placeholder="Enter Directory Name"
              />
              <div class="grid items-stretch flex">
                <input
                  id="federated_id"
                  v-model="directoryType"
                  class="d-none"
                  type="radio"
                  value="Federated ID"
                >
                <label
                  class="col-3 mt-5"
                  for="federated_id"
                >
                  <div
                    class="card cursor-pointer border-round directory-id h-full"
                    :class="{'active': directoryType==='Federated ID'}"
                  >
                    <div class="card-content">
                      <div class="card-button-body ">
                        <h6> Federated ID </h6>
                        <span class="type-info card-description">
                          Your organization owns and manages the account, and Single Sign-On authentication is performed via your SAML2-compatible Identity Provider.
                        </span>
                        <ul>
                          <li>Users don't need to create a separate password.</li>
                          <li>Your service provider will review and approve your request.</li>
                          <li>Configuration with your Identity Provider is required.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </label>
                <input
                  id="enterprise_id"
                  v-model="directoryType"
                  type="radio"
                  value="Enterprise ID"
                  class="d-none"
                >
                <label
                  class="col-3 mt-5"
                  for="enterprise_id"
                >
                  <div
                    class="card cursor-pointer border-round directory-id h-full"
                    :class="{'active': directoryType==='Enterprise ID'}"
                  >
                    <div class="card-content">
                      <div class="card-button-body ">
                        <h6> Enterprise ID </h6>
                        <span class="type-info card-description">
                          Your service provider hosts the Enterprise ID directory and performs authentication, but your organization owns and maintains the Enterprise ID account.
                        </span>
                        <ul>
                          <li>Users need to create a separate password.</li>
                          <li>No extra approval required.</li>
                          <li>No extra configuration required.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
              <Button
                :disabled="!directoryType || !directoryName"
                label="Next"
                class="flex ml-auto"
                type="submit"
              />
            </div>
          </form>
        </tab-content>
        <tab-content
          title="Additional Info"
          icon="ti-settings"
        >
          <form @submit.prevent="submitted">
            <div class="card">
              <h5>Select your identity provider</h5>
              <hr>
              <p>Select the identity provider that your organization uses to authenticate users.</p>
              <div class="col-12 grid items-stretch flex">
                <div
                  v-for="(provider, index) in providers"
                  :key="index"
                  class="col-3"
                >
                  <input
                    :id="provider.id"
                    v-model="selectedProvider"
                    class="d-none"
                    type="radio"
                    :value="provider"
                  >
                  <label
                    class="col-3 mt-5"
                    :for="provider.id"
                  >
                    <div
                      class="card cursor-pointer border-round directory-id h-full"
                      :class="{'active': selectedProvider?.name === provider.name}"
                    >
                      <div class="card-content">
                        <div class="card-button-body ">
                          <i
                            v-if="provider.type === 'other'"
                            class="pi pi-key"
                          />
                          <i
                            v-else
                            :class="'pi pi-'+provider.type"
                          />
                          <h6>{{ provider.name }}</h6>
                          <span class="type-info card-description">{{ provider.description }}</span>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
              <div class="col-12 mt-3 flex justify-content-between">
                <Button
                  label="Back"
                  @click="goToBack"
                />
                <Button
                  :disabled="!selectedProvider"
                  label="Submit"
                  class="flex ml-auto"
                  type="submit"
                />
              </div>
            </div>
          </form>
        </tab-content>
      </FormWizard>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { FormWizard, TabContent } from 'vue3-form-wizard';
import { useToastService } from '@/composables/useToast.mjs';
import 'vue3-form-wizard/dist/style.css';

export default defineComponent({
  components: {
    FormWizard, TabContent,
  },
  setup() {
    const directoryName = ref(null);
    const directoryType = ref(null);
    const wizard = ref(null);
    const selectedProvider = ref(null);
    const { dispatch, getters } = useStore();
    const { showToast } = useToastService();
    const { push } = useRouter();
    const submitted = async () => {
      await dispatch('createDirectory', {
        name: directoryName.value,
        type: directoryType.value,
        providerId: selectedProvider.value.id,
      });
      const error = getters.createDirError;
      const directory = getters.newDirectory;
      if (error) {
        showToast({
          severity: 'error',
          summary: 'Error',
          detail: error,
        });
      } else {
        push(`/create-directory/${directory.id}`);
      }
    };

    const providers = computed(() => getters.providers);
    onMounted(async () => {
      await dispatch('getAllProviders');
    });
    const changeTab = () => {
      wizard.value.nextTab();
    };

    const goToBack = () => {
      wizard.value.prevTab();
    };

    return {
      directoryName,
      directoryType,
      submitted,
      wizard,
      selectedProvider,
      changeTab,
      goToBack,
      providers,
    };
  },
});
</script>

<style>
.directory-id {
    border: .125rem solid #0000;
    box-shadow: 0 0 0.0625rem #8e8e8e;
}
.directory-id.active{
    border: .125rem solid #2680eb;
}
.wizard-progress-with-circle {
  display: none;
}
.wizard-nav.wizard-nav-pills {
  display: none;
}
</style>
