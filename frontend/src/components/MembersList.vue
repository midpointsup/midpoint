<template>
  <div class="members-list">
    <h6>
      Members <span>({{ members.length + 1 }} members)</span>
    </h6>
    <ul class="members">
      <li :key="you" :class="{ loading: !you.location }">
        <img
          class="rounded-circle"
          src="https://avatars.githubusercontent.com/u/57234754?s=400&u=7928d03725e3a137f7c37cd146c6cf0177b4765a&v=4"
          width="24px"
          height="24px"
        />
        <span>{{ you.name }} (You)</span>
      </li>
      <li
        v-for="member in members"
        :key="member"
        :class="{ loading: !member.location }"
      >
        <img src="@/assets/static/user.png" width="24px" height="24px" />
        <span>{{ member }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    members: {
      type: Array,
      default: () => [],
    },
    you: {
      type: Object,
      default: () => ({}),
    },
  },
};
</script>

<style>
.members {
  margin-top: 20px;
  list-style-type: none;
  padding: 0px;

  > * {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    gap: 5px;

    &::after {
      content: "";
      margin-left: 5px;
      width: 20px;
      height: 20px;
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
    }

    &.loading::after {
      background-image: url("@/assets/static/icons8-loading.gif");
    }

    &:not(.loading)::after {
      background-image: url("@/assets/static/checked.png");
    }
  }
}
</style>
