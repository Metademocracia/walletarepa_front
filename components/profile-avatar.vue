<template>
  <v-badge
    bottom
    :inline="showName || showNameV2"
    offset-x="12"
    offset-y="15"
    style="--bg: transparent;"
  >
    <v-img-load
      :src="profile.avatar"
      alt="profile avatar"
      :sizes="sizes"
      rounded="50%"
      cover
    />
    
    <div v-if="showName || showNameV2" class="ml-2">
      <span class="d-block profile-name mb-1">{{ profile.name }}</span>

      <div v-if="profile?.verified && showNameV2" class="d-flex align-center" style="gap: 3px;">
        <img src="@/assets/sources/icons/checked.svg" alt="check icon">
        <span class="verifier-text">Verified Merchant</span>
      </div>
    </div>

    <template v-if="profile?.verified && !showNameV2" #badge>
      <img src="@/assets/sources/icons/checked.svg" alt="check icon">
    </template>
  </v-badge>
</template>

<script>
export default {
  name: "ProfileAvatar",
  props: {
    sizes: {
      type: String,
      default: "30px"
    },
    showName: {
      type: Boolean,
      default: false
    },
    showNameV2: {
      type: Boolean,
      default: false
    },
    profile: {
      type: Object,
      default: undefined
    }
  }
}
</script>

<style scoped lang="scss">
img[alt="check icon"] {
  width: 15px;
  height: 15px;
}

.profile-name {
  --c: #000 !important;
  font-family: var(--font3) !important;
  font-size: 14px !important;
  font-weight: 400 !important;
  letter-spacing: 0.03em !important;
}

.verifier-text {
  --c: #000 !important;
  font-family: var(--font1) !important;
  font-size: 10px !important;
  font-weight: 400 !important;
  line-height: 10.89px !important;
  letter-spacing: -0.01em !important;
}
</style>
