<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-card-title class="text-h5 text-center pt-6">
            Baking in Bliss
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="login">
              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                :error-messages="errorMessage"
                variant="outlined"
                class="mb-4"
              ></v-text-field>
              <v-text-field
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                label="Contraseña"
                :error-messages="errorMessage"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showPassword = !showPassword"
                variant="outlined"
                class="mb-4"
              ></v-text-field>
              <v-btn
                color="primary"
                block
                type="submit"
                :loading="loading"
              >
                Ingresar
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'

const router = useRouter()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')
const loading = ref(false)
const auth = getAuth()

const login = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value)
    const user = userCredential.user
    
    const token = await user.getIdToken()
    localStorage.setItem('authToken', token)
    
    router.push('/stock')
  } catch (error) {
    console.error('Error de autenticación:', error)
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage.value = 'Email inválido'
        break
      case 'auth/user-disabled':
        errorMessage.value = 'Usuario deshabilitado'
        break
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        errorMessage.value = 'Email o contraseña incorrectos'
        break
      default:
        errorMessage.value = 'Error al iniciar sesión'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.v-card {
  border-radius: 8px;
}
</style> 