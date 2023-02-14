<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <h5>Account Settings</h5>
        <div>
          <form id="accountSettingForm" @submit.prevent="submitHandler">
            <label for="name" class="block text-900 font-medium mb-2 mt-3">Full Name</label>
            <InputText id="name" v-model="name" type="text" class="w-full mb-1" />
            <small v-if="v$.name.$error" class="p-error mb-2">{{ v$.name.$errors[0].$message }}</small>

            <label for="email1" class="block text-900 font-medium mb-2 mt-2">Email</label>
            <InputText id="email1" v-model="email" type="email" class="w-full mb-1" />
            <small v-if="v$.email.$error" class="p-error mb-2">{{ v$.email.$errors[0].$message }}</small>

            <label for="timezone" class="block text-900 font-medium mb-2 mt-2">Time Zone</label>
            <Dropdown id="timezone" v-model="timezone" class="w-full mb-1" placeholder="Select Timezone" :options="timeZones" optionLabel="text" />
            <!-- <small v-if="v$.email.$error" class="p-error mt-2">{{ v$.email.$errors[0].$message }}</small> -->

            <label for="phone" class="block text-900 font-medium mb-2 mt-2">Phone Number</label>
            <InputText id="phone" v-model="phone" type="number" class="w-full mb-1" />
            <!-- <small v-if="v$.email.$error" class="p-error mb-2">{{ v$.email.$errors[0].$message }}</small> -->

            <Button label="Save" icon="pi pi-save" type="submit" form="accountSettingForm" class="mt-2 e2e-add-accountsetting" />
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useStore } from 'vuex';
import { toRefs, reactive, computed, onMounted, ref } from 'vue-demi';
import { useVuelidate } from '@vuelidate/core';
import http from '../plugins/axios.mjs';
import { accountSettingSchema } from '../validation/user.mjs';
import { useToastService } from '../composables/useToast.mjs';

export default {
  name: 'AccountSetting',
  setup() {
    const { dispatch, getters } = useStore();
    const rules = computed(() => accountSettingSchema());
    const timeZones = ref(null);
    const { showToast } = useToastService();
    const state = reactive({
      name: '',
      email: '',
      timezone: '',
      phone: '',
    });
    const v$ = useVuelidate(rules, state);
    const userId = computed(() => getters.UserID);
    const userData = computed(() => getters.selectedUser);
    const submitHandler = async () => {
      v$.value.$validate();
      if (!v$.value.$error) {
        const payload = {
          id: userId.value,
          body: {
            full_name: state.name,
            email: state.email,
            timezoneid: state.timezone.id,
            phoneNo: state.phone,
          },
        };
        try {
          await dispatch('updateUser', payload);
          showToast({
            severity: 'success',
            summary: 'Success',
            detail: 'Account Detail Updated SuccessFully',
          });
        } catch (e) {
          showToast({
            severity: 'error',
            summary: 'Error',
            detail: 'An unexpted issue occured while updating your account details',
          });
        }
      }
    };
    onMounted(
      async () => {
        await dispatch('getUser', userId.value);
        const result = await http.get('/api/timezones');
        timeZones.value = result?.data?.Timezones;
        if (userData.value) {
          state.timezone = userData.value?.Timezone ? timeZones.value.find(el => el.id === userData.value.Timezone.id) : '';
          state.name = userData.value?.full_name;
          state.email = userData.value?.email;
          state.phone = userData.value?.phoneNo;
        }
      },
    );
    return {
      v$,
      timeZones,
      submitHandler,
      ...toRefs(state),
    };
  },
};
</script>
