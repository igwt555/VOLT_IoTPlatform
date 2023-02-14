<template>
  <VoltDialog
    activatorText="Add User"
    header="Add User"
    class="p-button mb-2 ml-3"
    :style="{ width: '50vw' }"
    :breakpoints="{ '960px': '75vw', '640px': '100vw' }"
    @opened="openModal"
  >
    <div class="p-fluid">
      <form id="myForm" autocomplete="off">
        <div class="mb-2">
          <label for="full_name">Full Name</label>
          <InputText
            id="full_name"
            v-model="full_name"
            type="text"
            class="w-full"
            :class="v$.full_name.$error ? 'p-invalid': ''"
          />
          <small v-if="v$.full_name.$error" class="p-error">{{ v$.full_name.$errors[0].$message }}</small>
        </div>

        <div class="mb-2">
          <label for="email">Email</label>
          <InputText
            id="email"
            v-model="email"
            type="email"
            class="w-full"
            :class="v$.email.$error ? 'p-invalid': ''"
          />
          <small v-if="v$.email.$error" class="p-error">{{ v$.email.$errors[0].$message }}</small>
        </div>

        <div class="mb-2">
          <label for="password">Password</label>
          <Password
            v-model="password"
            toggle-mask
            placeholder="Password"
            class="password-input w-full"
            :class="v$.password.$error ? 'p-invalid': ''"
            input-class="w-full"
            :feedback="false"
          />
          <small v-if="v$.password.$error" class="p-error">{{ v$.password.$errors[0].$message }}</small>
        </div>

        <div class="mb-2">
          <label for="confirm_password">Confirm Password</label>
          <Password
            v-model="confirm_password"
            toggle-mask
            placeholder="Confirm Password"
            class="password-input w-full"
            :class="v$.confirm_password.$error ? 'p-invalid': ''"
            input-class="w-full"
            :feedback="false"
          />
          <small v-if="v$.confirm_password.$error" class="p-error">{{ v$.confirm_password.$errors[0].$message }}</small>
        </div>

        <div class="mb-2">
          <label for="role">Role</label>
          <Dropdown
            id="role"
            v-model="role"
            :options="roles"
            option-label="name"
            placeholder="Select Role"
            :class="v$.role.$error ? 'p-invalid': ''"
          />
          <small v-if="v$.role.$error" class="p-error">{{ v$.role.$errors[0].$message }}</small>
        </div>

        <div class="mb-2">
          <label for="Account">Account</label>
          <Dropdown
            id="Account"
            v-model="organization_id"
            :options="orgs"
            option-label="name"
            option-value="value"
            placeholder="Select Account"
            :class="v$.organization_id.$error ? 'p-invalid': ''"
          />
          <small v-if="v$.organization_id?.$error" class="p-error">
            {{ v$.organization_id?.$errors[0]?.$message }}
          </small>
        </div>
      </form>
    </div>
    <template #footer="{ closeDialog }">
      <Button
        label="Cancel"
        icon="pi pi-times"
        class="p-button-text"
        @click="closeDialog"
      />
      <Button
        label="Proceed"
        icon="pi pi-check"
        class="e2e-add-user"
        autofocus
        type="submit"
        @click.prevent="submitHandler(closeDialog)"
      />
    </template>
  </VoltDialog>
</template>

<script setup>
import { reactive, toRefs, computed } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { useStore } from 'vuex';
import { userValidations } from '../../validation/user.mjs';
import VoltDialog from '../../components/VoltDialog.vue';

const { getters, dispatch } = useStore();
const orgs = computed(() => getters.flatOrgs);
const organizationId = computed(() => getters.organizationId);
const rolesData = computed(() => getters.roles.filter(el => !el.organization_id
|| el.organization_id === organizationId.value));
const roles = computed(() => rolesData.value
  .filter(el => el.name !== 'Account Holder')
  .map(elm => ({ name: elm.name, value: elm.id })));

const value = reactive({
  password: '',
  confirm_password: '',
  full_name: '',
  role: '',
  email: '',
  organization_id: '',
  role_id: '',
});

const { password, confirm_password, full_name, email, role, organization_id } =
  toRefs(value);

const rules = computed(() => userValidations(value.password));
const v$ = useVuelidate(rules, value);

const openModal = () => {
  value.password = '';
  value.full_name = '';
  value.email = '';
  value.confirm_password = '';
  v$.value.$reset();
  if (orgs.value.length === 1) {
    value.organization_id = orgs?.value?.[0].value;
  } else {
    value.organization_id = '';
  }
  if (roles.value.length === 1) {
    value.role = roles?.value[0];
  } else {
    value.role = '';
  }
};

const submitHandler = async cb => {
  v$.value.$validate();
  if (!v$.value.$error) {
    await dispatch('createUser', {
      ...value,
      access_level: value.role.name,
      role_id: value.role.id,
    });
    cb();
  }
};
</script>
