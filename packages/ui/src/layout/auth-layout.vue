<template>
  <div class="grid m-0 auth-container">
    <div class="col-12 md:col-4 left-side p-0" />
    <div class="col-12 md:col-8 auth-content">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: 'AuthLayout',
};
</script>

<style lang="scss" scoped>
.auth-container {
  min-height: 100vh;
  .left-side {
    background-image: url(../assets/images/auth.png);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  .auth-content {
    background-image: url(../assets/images/effect-ondark.png),
      linear-gradient(180deg, #2e323f 0%, #0a061a 100%);
    background-repeat: no-repeat;

    display: grid;
    place-items: center;
    padding-left: 5rem;
  }
}
</style>
