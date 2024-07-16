<template>
  <div class="members-list">
    <h6>
      Members <span>({{ members.length }} members)</span>
    </h6>
    <ul class="members">
      <li
        v-for="member in members"
        :key="member"
        :class="{ loading: !member.Trips[0].startLocation }"
      >
        <img
          v-if="member.picture"
          :src="member.picture"
          class="rounded-circle"
          width="24px"
          height="24px"
        />
        <img
          v-else
          src="@/assets/static/user.png"
          class="rounded-circle"
          width="24px"
          height="24px"
        />
        <span v-if="member.username === you.name">{{ you.name }} (You)</span>
        <span v-else>{{ member.username }}</span>
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
