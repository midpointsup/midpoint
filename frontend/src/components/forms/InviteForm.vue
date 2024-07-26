<template>
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <input type="email" id="email" v-model="email" class="input-simple" placeholder="Enter email" required>
      </div>
      <button type="submit" class="btn btn-primary">Invite</button>
    </form>

</template>