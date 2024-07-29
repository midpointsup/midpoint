<template>
  <div class="members-list">
    <h6>
      Members <span>({{ membersList.length }} members)</span>
    </h6>
    <ul class="members">
      <li
        v-for="member in membersList"
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
import io from "socket.io-client";
export default {
  data() {
    return {
      socket: null,
      membersList: [],
    };
  },
  props: {
    members: {
      type: Array,
      default: () => [],
    },
    you: {
      type: Object,
      default: () => ({}),
    },
    selectedPlan: {
      type: Object,
      default: () => ({}),
    },
  },
  mounted() {
    this.membersList = this.members;
    this.socket = io("http://localhost:3000");

    this.socket.on("connect", () => {
      this.socket.emit("join-room", "room" + this.selectedPlan.id);
    });

    this.socket.on("trip", (data) => {
      this.membersList = this.membersList.map((member) => {
        if (member.id === data.UserId) {
          if (member.Trips && member.Trips.length > 0) {
            member.Trips[0] = data;
          }
        }
        return member;
      });
    });
  },
  beforeUnmount() {
    this.disconnectSocket();
  },
  methods: {
    disconnectSocket() {
      if (this.socket) {
        this.socket.disconnect();
      }
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
