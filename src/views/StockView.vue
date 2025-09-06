<template>
  <v-container fluid class="pa-2 pa-sm-4">
    <v-card class="pa-2 pa-sm-4">
      <v-card-title class="text-h5 font-weight-bold primary--text mb-4">
        🍰 Recetario Baking in Bliss
      </v-card-title>

      <v-container class="pa-0 pb-4">
        <v-row>
          <v-col cols="12" sm="6" md="6">
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Buscar"
              single-line
              hide-details
              outlined
              dense
            ></v-text-field>
          </v-col>
          
          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="categoryFilter"
              :items="categoryFilterOptions"
              label="Filtrar por Categoría"
              outlined
              dense
              hide-details
            ></v-select>
          </v-col>
          
          <v-col cols="12" sm="6" md="3">
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              block
              @click="openAddDialog"
            >
              Agregar receta
            </v-btn>
          </v-col>
        </v-row>
        
      </v-container>

              <v-data-table
        :headers="headers"
        :items="filteredRecipes"
        :loading="loading"
        :search="search"
        :items-per-page="10"
        class="elevation-1 recipes-table"
        hover
        mobile-breakpoint="0"
        show-expand
        :expanded="expanded"
        @update:expanded="expanded = $event"
      >
        <template v-slot:loading>
          <v-skeleton-loader
            type="table-row@10"
          ></v-skeleton-loader>
        </template>
        <template v-slot:no-data>
          <v-alert
            :type="errorMessage ? 'error' : 'info'"
            class="ma-4"
          >
            {{ errorMessage || 'No hay datos disponibles.' }}
          </v-alert>
        </template>
        <template v-slot:[`item.cantidad`]="{ item }">
          <span v-if="item.categoria === 'cupcakes' && item.cantidad">
            {{ item.cantidad }} unidades
          </span>
          <span v-else class="text-grey">
            -
          </span>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <div class="d-flex justify-center gap-0">
            <v-btn
              icon="mdi-pencil"
              size="small"
              color="primary"
              variant="text"
              density="compact"
              @click="openEditDialog(item)"
            ></v-btn>
            <v-btn
              icon="mdi-delete"
              size="small"
              color="error"
              variant="text"
              density="compact"
              @click="confirmDelete(item)"
            ></v-btn>
          </div>
        </template>
        <template v-slot:expanded-row="{ item }">
          <tr>
            <td :colspan="headers.length" class="pa-4">
              <v-card flat class="ma-2">
                <v-card-text>
                  <v-row>
                    <v-col cols="12" md="6">
                      <h4 class="text-h6 mb-3 text-primary">📋 Ingredientes</h4>
                      <div class="ingredients-text">{{ item.ingredientes || 'No especificado' }}</div>
                    </v-col>
                    <v-col cols="12" md="6">
                      <h4 class="text-h6 mb-3 text-primary">👨‍🍳 Instrucciones</h4>
                      <div class="instructions-text">{{ item.instrucciones || 'No especificado' }}</div>
                    </v-col>
                  </v-row>
                  <v-row class="mt-4" v-if="item.resistencia">
                    <v-col cols="12">
                      <h4 class="text-h6 mb-2 text-primary">🔥 Información del Horno</h4>
                      <v-chip color="orange" text-color="white" class="mr-2">
                        <v-icon start>mdi-thermometer</v-icon>
                        {{ item.temperatura || 'No especificado' }}
                      </v-chip>
                      <v-chip color="red" text-color="white">
                        <v-icon start>mdi-fire</v-icon>
                        {{ item.resistencia || 'No especificado' }}
                      </v-chip>
                    </v-col>
                  </v-row>
                  <!-- FOTOS COMENTADAS - Se implementarán más adelante
                  <v-row class="mt-4" v-if="item.fotos && item.fotos.length > 0">
                    <v-col cols="12">
                      <h4 class="text-h6 mb-3 text-primary">📸 Fotos de la Receta</h4>
                      <v-row>
                        <v-col 
                          v-for="(photo, index) in item.fotos" 
                          :key="index" 
                          cols="12" 
                          sm="6" 
                          md="4"
                        >
                          <v-card outlined class="photo-card">
                            <v-img
                              :src="getPhotoUrl(photo)"
                              height="200"
                              cover
                              class="photo-image"
                              @error="console.log('Error cargando foto:', photo, 'URL generada:', getPhotoUrl(photo))"
                              @load="console.log('Foto cargada exitosamente:', photo)"
                            >
                              <template v-slot:placeholder>
                                <v-row
                                  class="fill-height ma-0"
                                  align="center"
                                  justify="center"
                                >
                                  <v-progress-circular
                                    indeterminate
                                    color="primary"
                                  ></v-progress-circular>
                                </v-row>
                              </template>
                              <template v-slot:error>
                                <v-row
                                  class="fill-height ma-0"
                                  align="center"
                                  justify="center"
                                >
                                  <v-col class="text-center">
                                    <v-icon size="48" color="grey">mdi-image-broken</v-icon>
                                    <div class="text-caption mt-2">Error cargando imagen</div>
                                  </v-col>
                                </v-row>
                              </template>
                            </v-img>
                            <v-card-text class="text-caption pa-2">
                              <div><strong>Índice:</strong> {{ index }}</div>
                              <div><strong>Tipo:</strong> {{ typeof photo }}</div>
                              <div><strong>URL:</strong> {{ getPhotoUrl(photo) ? 'Generada' : 'No disponible' }}</div>
                              <div v-if="photo instanceof File"><strong>Archivo:</strong> {{ photo.name }}</div>
                            </v-card-text>
                          </v-card>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                  <v-row class="mt-4" v-else-if="item.fotos === undefined || item.fotos === null">
                    <v-col cols="12">
                      <v-alert type="info" variant="tonal">
                        <v-icon start>mdi-information</v-icon>
                        No hay fotos disponibles para esta receta
                      </v-alert>
                    </v-col>
                  </v-row>
                  -->
                </v-card-text>
              </v-card>
            </td>
          </tr>
        </template>
        </v-data-table>
      </v-card>

    <v-dialog v-model="editDialog" max-width="600px">
      <v-card>
        <v-card-title class="text-h5">
          Editar Receta
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="editingItem.nombre"
                  label="Nombre de la receta"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editingItem.categoria"
                  :items="categoryFilterOptions.slice(1)"
                  label="Categoría"
                  outlined
                  dense
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editingItem.tiempo"
                  label="Tiempo (ej: 30 min)"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editingItem.temperatura"
                  label="Temperatura de horno (ej: 180°C)"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editingItem.resistencia"
                  label="Resistencia del horno (ej: Fuego medio)"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" v-if="editingItem.categoria === 'cupcakes'">
                <v-text-field
                  v-model.number="editingItem.cantidad"
                  type="number"
                  label="Cantidad de cupcakes"
                  min="1"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editingItem.ingredientes"
                  label="Ingredientes"
                  outlined
                  rows="3"
                ></v-textarea>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editingItem.instrucciones"
                  label="Instrucciones"
                  outlined
                  rows="4"
                ></v-textarea>
              </v-col>
              <!-- FOTOS COMENTADAS - Se implementarán más adelante
              <v-col cols="12">
                <v-card outlined class="pa-4">
                  <v-card-title class="text-h6 pa-0 mb-3">
                    📸 Fotos de la Receta
                  </v-card-title>
                  <v-card-text class="pa-0">
                    <v-file-input
                      multiple
                      accept="image/*"
                      label="Seleccionar fotos (máximo 2)"
                      prepend-icon="mdi-camera"
                      show-size
                      counter
                      :rules="photoRules"
                      @change="handleEditPhotoChange"
                      ref="editPhotoInput"
                    ></v-file-input>
                    <div v-if="editingItem.fotos && editingItem.fotos.length > 0" class="mt-3">
                      <v-row>
                        <v-col 
                          v-for="(photo, index) in editingItem.fotos" 
                          :key="index" 
                          cols="12" 
                          sm="6"
                        >
                          <v-card outlined>
                            <v-img
                              :src="getPhotoUrl(photo)"
                              height="150"
                              cover
                            ></v-img>
                            <v-card-actions>
                              <v-btn
                                color="error"
                                size="small"
                                variant="text"
                                @click="removeEditPhoto(index)"
                              >
                                <v-icon>mdi-delete</v-icon>
                                Eliminar
                              </v-btn>
                            </v-card-actions>
                          </v-card>
                        </v-col>
                      </v-row>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
              -->
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="editDialog = false">
            Cancelar
          </v-btn>
          <v-btn color="primary" @click="saveEdit">
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="addDialog" max-width="600px">
      <v-card>
        <v-card-title class="text-h5">
          Agregar Receta
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="newItem.nombre"
                  label="Nombre de la receta"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="newItem.categoria"
                  :items="categoryFilterOptions.slice(1)"
                  label="Categoría"
                  outlined
                  dense
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="newItem.tiempo"
                  label="Tiempo (ej: 30 min)"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="newItem.temperatura"
                  label="Temperatura de horno (ej: 180°C)"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="newItem.resistencia"
                  label="Resistencia del horno (ej: Fuego medio)"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" v-if="newItem.categoria === 'cupcakes'">
                <v-text-field
                  v-model.number="newItem.cantidad"
                  type="number"
                  label="Cantidad de cupcakes"
                  min="1"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="newItem.ingredientes"
                  label="Ingredientes"
                  outlined
                  rows="3"
                ></v-textarea>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="newItem.instrucciones"
                  label="Instrucciones"
                  outlined
                  rows="4"
                ></v-textarea>
              </v-col>
              <!-- FOTOS COMENTADAS - Se implementarán más adelante
              <v-col cols="12">
                <v-card outlined class="pa-4">
                  <v-card-title class="text-h6 pa-0 mb-3">
                    📸 Fotos de la Receta
                  </v-card-title>
                  <v-card-text class="pa-0">
                    <v-file-input
                      multiple
                      accept="image/*"
                      label="Seleccionar fotos (máximo 2)"
                      prepend-icon="mdi-camera"
                      show-size
                      counter
                      :rules="photoRules"
                      @change="handlePhotoChange"
                      ref="newPhotoInput"
                    ></v-file-input>
                    <div v-if="newItem.fotos && newItem.fotos.length > 0" class="mt-3">
                      <v-row>
                        <v-col 
                          v-for="(photo, index) in newItem.fotos" 
                          :key="index" 
                          cols="12" 
                          sm="6"
                        >
                          <v-card outlined>
                            <v-img
                              :src="getPhotoUrl(photo)"
                              height="150"
                              cover
                            ></v-img>
                            <v-card-actions>
                              <v-btn
                                color="error"
                                size="small"
                                variant="text"
                                @click="removePhoto(index)"
                              >
                                <v-icon>mdi-delete</v-icon>
                                Eliminar
                              </v-btn>
                            </v-card-actions>
                          </v-card>
                        </v-col>
                      </v-row>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
              -->
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="closeAddDialog">
            Cancelar
          </v-btn>
          <v-btn color="primary" @click="saveNewItem">
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">
          Confirmar Eliminación
        </v-card-title>
        <v-card-text>
          ¿Estás seguro que deseas eliminar esta receta?
          <div class="text-subtitle-1 mt-2">
            {{ deletingItem.nombre }}
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="deleteDialog = false">
            Cancelar
          </v-btn>
          <v-btn color="error" @click="deleteItem">
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    </v-container>
  </template>
  
  <script setup>
import { ref, computed, onMounted } from 'vue'
import { getDatabase, ref as dbRef, onValue, set, remove, push } from 'firebase/database'
import { database } from '../firebase'

const recipesRef = dbRef(database, 'recipes')

const recipes = ref([])
  const loading = ref(true)
const search = ref('')
const errorMessage = ref('')
const categoryFilter = ref('todas')
const categoryFilterOptions = [
  { title: 'Todas', value: 'todas' },
  { title: 'Budin', value: 'budin' },
  { title: 'Cupcakes', value: 'cupcakes' }
]
  
  const headers = [
  { 
    title: 'Nombre', 
    key: 'nombre', 
    sortable: true,
    align: 'start',
    class: 'text-subtitle-1 font-weight-bold'
  },
  { 
    title: 'Categoría', 
    key: 'categoria', 
    sortable: true,
    align: 'start',
    class: 'text-subtitle-1 font-weight-bold'
  },
  { 
    title: 'Tiempo', 
    key: 'tiempo', 
    sortable: true,
    align: 'center',
    class: 'text-subtitle-1 font-weight-bold'
  },
  { 
    title: 'Temperatura', 
    key: 'temperatura', 
    sortable: true,
    align: 'center',
    class: 'text-subtitle-1 font-weight-bold'
  },
  { 
    title: 'Cantidad', 
    key: 'cantidad', 
    sortable: true,
    align: 'center',
    class: 'text-subtitle-1 font-weight-bold'
  },
  {
    title: 'Acciones',
    key: 'actions',
    sortable: false,
    align: 'center',
    class: 'text-subtitle-1 font-weight-bold'
  }
]

const editDialog = ref(false)
const addDialog = ref(false)
const deleteDialog = ref(false)
const expanded = ref([])
const editingItem = ref({})
const deletingItem = ref({})
const newItem = ref({
  nombre: '',
  categoria: '',
  tiempo: '',
  temperatura: '',
  resistencia: '',
  ingredientes: '',
  instrucciones: '',
  cantidad: 0
  // fotos: [] - Comentado para implementar más adelante
})

// REGLAS DE FOTOS COMENTADAS - Se implementarán más adelante
/*
const photoRules = [
  (files) => {
    if (!files || files.length === 0) return true
    if (files.length > 2) return 'Máximo 2 fotos permitidas'
    const maxSize = 5 * 1024 * 1024 // 5MB
    for (let file of files) {
      if (file.size > maxSize) {
        return 'Cada foto debe ser menor a 5MB'
      }
    }
    return true
  }
]
*/

const filteredRecipes = computed(() => {
  let filtered = recipes.value

  if (categoryFilter.value !== 'todas') {
    filtered = filtered.filter(item => item.categoria === categoryFilter.value)
  }

  return filtered
})


const openEditDialog = (item) => {
  editingItem.value = { ...item }
  editDialog.value = true
}

const openAddDialog = () => {
  newItem.value = {
    nombre: '',
    categoria: '',
    tiempo: '',
    temperatura: '',
    resistencia: '',
    ingredientes: '',
    instrucciones: '',
    cantidad: 0
    // fotos: [] - Comentado para implementar más adelante
  }
  addDialog.value = true
}

const closeAddDialog = () => {
  addDialog.value = false
  newItem.value = {
    nombre: '',
    categoria: '',
    tiempo: '',
    temperatura: '',
    resistencia: '',
    ingredientes: '',
    instrucciones: '',
    cantidad: 0
    // fotos: [] - Comentado para implementar más adelante
  }
}

const confirmDelete = (item) => {
  deletingItem.value = { ...item }
  deleteDialog.value = true
}

// FUNCIONES DE FOTOS COMENTADAS - Se implementarán más adelante
/*
// Funciones para manejar fotos
const getPhotoUrl = (photo) => {
  console.log('Procesando foto:', photo, 'Tipo:', typeof photo)
  
  if (!photo) {
    console.log('Foto vacía o nula')
    return ''
  }
  
  // Si es una URL string (incluyendo base64)
  if (typeof photo === 'string') {
    console.log('Es una string URL:', photo.substring(0, 50) + '...')
    return photo
  }
  
  // Si es un archivo File
  if (photo instanceof File) {
    console.log('Es un archivo File:', photo.name, photo.type)
    const url = URL.createObjectURL(photo)
    console.log('URL generada para archivo:', url)
    return url
  }
  
  // Si es un número o booleano (metadatos de Firebase), ignorar
  if (typeof photo === 'number' || typeof photo === 'boolean') {
    console.warn('Ignorando metadato de Firebase:', photo)
    return ''
  }
  
  // Si es un objeto con propiedades (puede venir de Firebase)
  if (typeof photo === 'object' && photo !== null) {
    console.log('Es un objeto, buscando propiedades:', Object.keys(photo))
    
    // Buscar propiedades que puedan contener la URL
    if (photo.url) {
      console.log('Encontrada propiedad url:', photo.url)
      return photo.url
    }
    if (photo.src) {
      console.log('Encontrada propiedad src:', photo.src)
      return photo.src
    }
    if (photo.path) {
      console.log('Encontrada propiedad path:', photo.path)
      return photo.path
    }
    if (photo.name) {
      console.log('Encontrada propiedad name:', photo.name)
      return photo.name
    }
  }
  
  console.warn('Tipo de foto no reconocido:', typeof photo, photo)
  return ''
}

const handlePhotoChange = (event) => {
  console.log('Evento de cambio de fotos:', event)
  const files = event.target.files || []
  const fileArray = Array.from(files)
  
  console.log('Archivos extraídos:', fileArray)
  
  if (fileArray.length > 2) {
    newItem.value.fotos = fileArray.slice(0, 2)
  } else {
    newItem.value.fotos = fileArray
  }
  
  console.log('Fotos asignadas a newItem:', newItem.value.fotos)
}

const handleEditPhotoChange = (event) => {
  console.log('Evento de cambio de fotos (edición):', event)
  const files = event.target.files || []
  const fileArray = Array.from(files)
  
  console.log('Archivos extraídos (edición):', fileArray)
  
  if (fileArray.length > 2) {
    editingItem.value.fotos = fileArray.slice(0, 2)
  } else {
    editingItem.value.fotos = fileArray
  }
  
  console.log('Fotos asignadas a editingItem:', editingItem.value.fotos)
}

const removePhoto = (index) => {
  newItem.value.fotos.splice(index, 1)
}

const removeEditPhoto = (index) => {
  editingItem.value.fotos.splice(index, 1)
}

// Función para convertir archivos a URLs base64
const convertFilesToUrls = async (files) => {
  if (!files || !Array.isArray(files) || files.length === 0) {
    console.log('No hay archivos para convertir')
    return []
  }
  
  const urls = []
  for (const file of files) {
    if (file instanceof File) {
      try {
        const base64 = await fileToBase64(file)
        urls.push(base64)
        console.log('Archivo convertido a base64:', file.name)
      } catch (error) {
        console.error('Error convirtiendo archivo a base64:', error)
      }
    } else if (typeof file === 'string') {
      // Si ya es una URL, mantenerla
      urls.push(file)
      console.log('URL mantenida:', file)
    }
  }
  
  console.log('URLs generadas:', urls)
  return urls
}

// Función auxiliar para convertir archivo a base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}
*/


const saveEdit = async () => {
  try {
    const itemRef = dbRef(database, `recipes/${editingItem.value.id}`)
    await set(itemRef, {
      nombre: editingItem.value.nombre,
      categoria: editingItem.value.categoria,
      tiempo: editingItem.value.tiempo,
      temperatura: editingItem.value.temperatura,
      resistencia: editingItem.value.resistencia,
      ingredientes: editingItem.value.ingredientes,
      instrucciones: editingItem.value.instrucciones,
      cantidad: editingItem.value.cantidad || 0
      // fotos: fotosUrls - Comentado para implementar más adelante
    })
    editDialog.value = false
  } catch (error) {
    console.error('Error al guardar:', error)
    errorMessage.value = 'Error al guardar los cambios'
  }
}

const saveNewItem = async () => {
  try {
    const newItemRef = push(recipesRef)
    await set(newItemRef, {
      nombre: newItem.value.nombre,
      categoria: newItem.value.categoria,
      tiempo: newItem.value.tiempo,
      temperatura: newItem.value.temperatura,
      resistencia: newItem.value.resistencia,
      ingredientes: newItem.value.ingredientes,
      instrucciones: newItem.value.instrucciones,
      cantidad: newItem.value.cantidad || 0
      // fotos: fotosUrls - Comentado para implementar más adelante
    })
    closeAddDialog()
  } catch (error) {
    console.error('Error al agregar:', error)
    errorMessage.value = 'Error al agregar la receta'
  }
}

const deleteItem = async () => {
  try {
    const itemRef = dbRef(database, `recipes/${deletingItem.value.id}`)
    await remove(itemRef)
    deleteDialog.value = false
  } catch (error) {
    console.error('Error al eliminar:', error)
    errorMessage.value = 'Error al eliminar la receta'
  }
}

onMounted(() => {
  onValue(recipesRef, (snapshot) => {
    const data = snapshot.val()
    if (data) {
      recipes.value = Object.entries(data).map(([id, item]) => {
        console.log('Receta cargada:', item.nombre)
        return {
          id,
          ...item
        }
      })
    } else {
      recipes.value = []
    }
    loading.value = false
  }, (error) => {
    console.error('Error al cargar datos:', error)
    errorMessage.value = 'Error al cargar los datos'
      loading.value = false
  })
  })
  </script>

<style scoped>
.recipes-table {
  width: 100%;
  border-radius: 8px;
}

.recipes-table :deep(th) {
  background-color: #f5f5f5 !important;
  color: #1976d2 !important;
  font-size: 1rem !important;
  padding: 16px !important;
}

.recipes-table :deep(td) {
  padding: 12px 16px !important;
}

.recipes-table :deep(tr:hover) {
  background-color: #f5f5f5 !important;
}

.v-card-title {
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 16px;
}

.d-flex.justify-center.gap-0 {
  display: flex;
  justify-content: center;
  gap: 0.5px;
}

.ingredients-text,
.instructions-text {
  white-space: pre-line;
  line-height: 1.6;
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid #1976d2;
  font-size: 0.95rem;
}

.ingredients-text {
  border-left-color: #4caf50;
}

.instructions-text {
  border-left-color: #ff9800;
}

.photo-card {
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s ease-in-out;
}

.photo-card:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.photo-image {
  border-radius: 8px;
}


@media (max-width: 600px) {
  .recipes-table :deep(th),
  .recipes-table :deep(td) {
    padding: 8px !important;
    font-size: 0.875rem !important;
  }

  .v-card-title {
    font-size: 1.25rem !important;
  }

  .v-btn {
    min-width: 32px !important;
  }

  .v-text-field,
  .v-select {
    font-size: 0.875rem !important;
  }

  .ingredients-text,
  .instructions-text {
    font-size: 0.85rem !important;
    padding: 8px !important;
  }
}

@media (max-width: 400px) {
  .recipes-table :deep(th),
  .recipes-table :deep(td) {
    padding: 4px !important;
    font-size: 0.75rem !important;
  }

  .v-card-title {
    font-size: 1.1rem !important;
  }

  .v-text-field,
  .v-select {
    font-size: 0.75rem !important;
  }
}
</style>
  