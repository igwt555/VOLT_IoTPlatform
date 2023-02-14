<template>
  <div>
    <label :for="label">{{ label }}</label>
    <div class="flex">
      <div
        class="border-500 surface-overlay border-3 border-round
        font-bold my-2 flex align-items-center justify-content-center currentImageBox">
        <img :src="currentLogo" class="currentImage">
      </div>
      <div class="image-upload-wrap my-2 mx-3">
        <div class="drag-text">
          <h3>Drop {{ label }} Image or click to select a file to upload</h3>
        </div>
        <input
          class="file-upload-input" type="file"
          accept="image/*" @change="uploadImageToPreviewBox($event)">
      </div>
      <div>
        <button class="cancelButton">x</button>
      </div>
    </div>
    <ImagePreviewModal ref="previewBox" :label="label" :image-source="imgSrc" />
  </div>
</template>

<script>
import { ref } from 'vue-demi';
import ImagePreviewModal from './ImagePreviewModal.vue';
// eslint-disable-next-line import/no-unresolved
import img from '@/assets/images/default_company_logo.png';

export default {
  name: 'FileUploader',
  components: { ImagePreviewModal },
  props: {
    label: {
      type: String,
      default: '',
    },
    currentLogo: {
      type: String,
      default: '',
    },
  },
  setup() {
    const previewBox = ref(null);
    const imgSrc = ref(null);
    const uploadImageToPreviewBox = e => {
      imgSrc.value = URL.createObjectURL(e.target.files[0]);
      previewBox.value.openPreviewModal();
    };

    return {
      previewBox,
      img,
      imgSrc,
      uploadImageToPreviewBox,
    };
  },
};
</script>

<style scoped lang="scss">
  .cropper {
    height: 600px;
    width: 600px;
    background: #DDD;
  }
  .currentImageBox {
      height: 150px;
      width: 150px;
      text-align: center;
      line-height: 150px;
      .currentImage {
          height:auto;
          width:100%;
          padding: 10px;
      }
      @media screen and (max-width: 767px) {
        height: 100px;
        width: 100px;
        line-height: 100px;
      }
  }
  .image-upload-wrap {
    box-sizing: border-box;
    height: 150px;
    width: 90%;
    border: 4px dashed hsl(0, 0%, 64%);
    .file-upload-input {
        position: relative;
        bottom: 159px;
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        outline: none;
        opacity: 0;
        cursor: pointer;
    }
    .drag-text {
      text-align: center;
    }
    .drag-text h3 {
      font-weight: 100;
      text-transform: uppercase;
      font-size: 17px;
      color: #a3a3a3;
      padding: 60px 0;
    }
    @media screen and (max-width: 767px) {
      height: 100px;
      width: 70%;
      .drag-text h3 {
        font-size: 15px;
        padding: 35px 0;
      }
    }
  }
  .cancelButton {
      line-height: 150px;
      background-color: white;
      font-size: 30px;
      color: #a3a3a3;
      border:none;
      cursor: pointer;
      @media screen and (max-width: 767px) {
          line-height: 100px;
      }
  }
</style>
