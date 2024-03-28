<template>
  <div class="header">
    <Navbar
      :show-append="showAppend"
      :show-prepend="showPrepend"
      :hide-profile="hideProfile"
      :on-press-back-btn="onPressBackBtn ? () => onPressBackBtn() : null"
    >
      <template #prepend>
        <slot name="prepend" />
      </template>
    </Navbar>

    <div
      v-if="topText || bottomText || description"
      class="header-content"
      :style="`--max-width: ${maxWidth}; --margin-left: ${marginLeftContent}; --margin-right: ${marginRightContent}`"
    >
      <h1
        v-if="topText"
        :class="{p: bottomText, tcenter: topTextCenter}"
        :style="`--dir: ${topTextDir}; --indent: ${topTextIndent}`"
      >{{topText}}</h1>
      <h1
        v-if="middleText"
        :class="{p: bottomText, tcenter: middleTextCenter}"
        :style="`--dir: ${middleTextDir}; --indent: ${middleTextIndent}`"
      >{{middleText}}</h1>
      <h1
        v-if="bottomText"
        :class="{tcenter: bottomTextCenter}"
        :style="`--dir: ${bottomTextDir}; --indent: ${bottomTextIndent}`"
      >{{bottomText}}</h1>
      <p
        v-if="description"
        :style="`--align: ${descriptionAlign}`"
      >{{description}}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "HeaderComponent",
  props: {
    hideProfile: {
      type: Boolean,
      default: false,
    },
    showAppend: {
      type: Boolean,
      default: false,
    },
    maxWidth: {
      type: String,
      default: undefined,
    },
    showPrepend: {
      type: Boolean,
      default: true,
    },
    onPressBackBtn: {
      type: Function,
      default: undefined
    },
    marginLeftContent: {
      type: String,
      default: "auto",
    },
    marginRightContent: {
      type: String,
      default: "auto",
    },
    topText: {
      type: String,
      default: undefined
    },
    middleText: {
      type: String,
      default: undefined
    },
    bottomText: {
      type: String,
      default: undefined
    },
    topTextCenter: {
      type: Boolean,
      default: false
    },
    middleTextCenter: {
      type: Boolean,
      default: false
    },
    bottomTextCenter: {
      type: Boolean,
      default: false
    },
    topTextDir: {
      type: String,
      default: "ltr"
    },
    middleTextDir: {
      type: String,
      default: "ltr"
    },
    bottomTextDir: {
      type: String,
      default: "rtl"
    },
    topTextIndent: {
      type: String,
      default: undefined
    },
    middleTextIndent: {
      type: String,
      default: undefined
    },
    bottomTextIndent: {
      type: String,
      default: undefined
    },
    description: {
      type: String,
      default: undefined
    },
    descriptionAlign: {
      type: String,
      default: "center"
    },
  },
};
</script>

<style lang="scss">
.header {
  margin-top: var(--margin-header);
  width: 100%;
  display: flex;
  flex-direction: column;

  &-content{
    width: 100%;
    max-width: var(--max-width, auto);
    margin-left: var(--margin-left, auto);
    margin-right: var(--margin-right, auto);
    margin-top: 16px;

    h1:first-child {
      direction: var(--dir, ltr);
      text-indent: var(--indent);
    }

    h1 + h1 {
      direction: var(--dir, rtl);
      text-indent: var(--indent);
    }

    p {
      text-align: var(--align, center);
    }
  }
}
</style>
