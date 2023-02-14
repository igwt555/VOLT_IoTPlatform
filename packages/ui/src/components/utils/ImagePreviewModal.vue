<template>
  <Dialog
    v-model:visible="showModal" :header="label"
    :style="{width: '30vw', height: '40vh'}" position="center" class="dialogStyle">
    <Toast />
    <cropper
      class="cropper"
      :src="imageSource"
      @change="change"
    />
    <template #footer>
      <Button label="Cancel" class="p-button-text" @click="cancleUpload" />
      <Button label="Save" class="p-button-text" @click="onUpload" />
    </template>
  </Dialog>
</template>

<script>
import { useStore } from 'vuex';
import { useToast } from 'primevue/usetoast';
import Dialog from 'primevue/dialog';
import { computed, ref } from 'vue-demi';
import { Cropper } from 'vue-advanced-cropper';
// eslint-disable-next-line import/no-unresolved
import img from '@/assets/images/default_company_logo.png';
import 'vue-advanced-cropper/dist/style.css';

export default {
  name: 'ImagePreviewModal',
  components: {
    Dialog,
    Cropper,
  },
  props: {
    label: {
      type: String,
      default: '',
    },
    imageSource: {
      type: String,
      default: null,
    },
  },
  setup(props) {
    const { dispatch, getters } = useStore();
    const toast = useToast();
    const showModal = ref(false);
    const croppedFile = ref(null);
    const organizationId = computed(() => getters.organizationId);
    const change = async ({ coordinates, canvas }) => {
      const blob = await (await fetch(canvas.toDataURL())).blob();
      croppedFile.value = new File([blob], `${organizationId.value}${props.label}_${((coordinates.width * coordinates.height) + coordinates.height)}.png`, { type: 'image/png', lastModified: new Date() });
    };
    const cancleUpload = () => {
      showModal.value = false;
    };
    const onUpload = async () => {
      try {
        const data = new FormData();
        data.append('file', croppedFile.value);
        data.append('id', organizationId.value);
        data.append('type', props.label);

        await dispatch('updateCompanyLogo', data);

        // if (imageUpdateStatus.value) {
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: props.label ? 'Company icon updated' : 'Company logo updated',
          life: 3000,
        });
        showModal.value = false;
        // }
      } catch (error) {
        console.log(error);
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail:
            'An issue occured when uploading your company logo. Please contact support.',
        });
      }
    };
    const openPreviewModal = () => {
      showModal.value = true;
    };
    return {
      showModal,
      change,
      cancleUpload,
      onUpload,
      openPreviewModal,
      img,
    };
  },
};
</script>

<style>
.dialogStyle{
  background: white !important;
}
</style>
