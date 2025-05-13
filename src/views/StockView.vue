<template>
  <v-container fluid class="pa-2 pa-sm-4">
    <v-card class="pa-2 pa-sm-4">
      <v-card-title class="text-h5 font-weight-bold primary--text mb-4">
        Stock Serotonine - Nueva Cordoba
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
              v-model="stockFilter"
              :items="stockFilterOptions"
              label="Filtrar por Stock"
              outlined
              dense
              hide-details
            ></v-select>
          </v-col>
          
          <v-col cols="12" sm="12" md="3">
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              block
              @click="openAddDialog"
            >
              Agregar producto
            </v-btn>
          </v-col>
        </v-row>
      </v-container>

      <v-data-table
        :headers="headers"
        :items="filteredStock"
        :loading="loading"
        :search="search"
        :items-per-page="10"
        class="elevation-1 stock-table"
        hover
        mobile-breakpoint="0"
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
        <template v-slot:[`item.Cantidad`]="{ item }">
          <v-chip
            :color="getStockColor(item.Cantidad)"
            text-color="white"
            class="font-weight-bold"
          >
            {{ item.Cantidad }}
          </v-chip>
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
      </v-data-table>
    </v-card>

    <v-dialog v-model="editDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">
          Editar Stock
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <div class="text-subtitle-1 mb-2">
                  {{ editingItem.Modelo }} - {{ editingItem.Color }} - {{ editingItem.Talle }}
                </div>
                <v-text-field
                  v-model.number="editingItem.Cantidad"
                  type="number"
                  label="Cantidad"
                  min="0"
                  max="5"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
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

    <v-dialog v-model="addDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">
          Agregar Producto
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="newItem.Modelo"
                  label="Modelo"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="newItem.Color"
                  label="Color"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="newItem.Talle"
                  label="Talle"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model.number="newItem.Cantidad"
                  type="number"
                  label="Cantidad"
                  min="0"
                  max="5"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
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
          ¿Estás seguro que deseas eliminar este producto?
          <div class="text-subtitle-1 mt-2">
            {{ deletingItem.Modelo }} - {{ deletingItem.Color }} - {{ deletingItem.Talle }}
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

const stockRef = dbRef(database, 'stock')

const stock = ref([])
const loading = ref(true)
const search = ref('')
const errorMessage = ref('')
const stockFilter = ref('todos')
const stockFilterOptions = [
  { title: 'Todos', value: 'todos' },
  { title: 'Sin stock (0)', value: 'sin-stock' },
  { title: 'Stock bajo (1-2)', value: 'stock-bajo' },
  { title: 'Stock normal (3-5)', value: 'stock-normal' }
]

const headers = [
  { 
    title: 'Modelo', 
    key: 'Modelo', 
    sortable: true,
    align: 'start',
    class: 'text-subtitle-1 font-weight-bold'
  },
  { 
    title: 'Color', 
    key: 'Color', 
    sortable: true,
    align: 'start',
    class: 'text-subtitle-1 font-weight-bold'
  },
  { 
    title: 'Talle', 
    key: 'Talle', 
    sortable: true,
    align: 'center',
    class: 'text-subtitle-1 font-weight-bold'
  },
  { 
    title: 'Cantidad', 
    key: 'Cantidad', 
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
const editingItem = ref({})
const deletingItem = ref({})
const newItem = ref({
  Modelo: '',
  Color: '',
  Talle: '',
  Cantidad: 0
})

const filteredStock = computed(() => {
  let filtered = stock.value

  if (stockFilter.value === 'sin-stock') {
    filtered = filtered.filter(item => item.Cantidad === 0)
  } else if (stockFilter.value === 'stock-bajo') {
    filtered = filtered.filter(item => item.Cantidad > 0 && item.Cantidad <= 2)
  } else if (stockFilter.value === 'stock-normal') {
    filtered = filtered.filter(item => item.Cantidad > 2)
  }

  return filtered
})

const getStockColor = (cantidad) => {
  if (cantidad === 0) return 'error'
  if (cantidad <= 2) return 'warning'
  return 'success'
}

const openEditDialog = (item) => {
  editingItem.value = { ...item }
  editDialog.value = true
}

const openAddDialog = () => {
  newItem.value = {
    Modelo: '',
    Color: '',
    Talle: '',
    Cantidad: 0
  }
  addDialog.value = true
}

const closeAddDialog = () => {
  addDialog.value = false
  newItem.value = {
    Modelo: '',
    Color: '',
    Talle: '',
    Cantidad: 0
  }
}

const confirmDelete = (item) => {
  deletingItem.value = { ...item }
  deleteDialog.value = true
}

const saveEdit = async () => {
  try {
    const itemRef = dbRef(database, `stock/${editingItem.value.id}`)
    await set(itemRef, {
      Modelo: editingItem.value.Modelo,
      Color: editingItem.value.Color,
      Talle: editingItem.value.Talle,
      Cantidad: editingItem.value.Cantidad
    })
    editDialog.value = false
  } catch (error) {
    console.error('Error al guardar:', error)
    errorMessage.value = 'Error al guardar los cambios'
  }
}

const saveNewItem = async () => {
  try {
    const newItemRef = push(stockRef)
    await set(newItemRef, {
      Modelo: newItem.value.Modelo,
      Color: newItem.value.Color,
      Talle: newItem.value.Talle,
      Cantidad: newItem.value.Cantidad
    })
    closeAddDialog()
  } catch (error) {
    console.error('Error al agregar:', error)
    errorMessage.value = 'Error al agregar el producto'
  }
}

const deleteItem = async () => {
  try {
    const itemRef = dbRef(database, `stock/${deletingItem.value.id}`)
    await remove(itemRef)
    deleteDialog.value = false
  } catch (error) {
    console.error('Error al eliminar:', error)
    errorMessage.value = 'Error al eliminar el producto'
  }
}

onMounted(() => {
  onValue(stockRef, (snapshot) => {
    const data = snapshot.val()
    if (data) {
      stock.value = Object.entries(data).map(([id, item]) => ({
        id,
        ...item
      }))
    } else {
      stock.value = []
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
.stock-table {
  width: 100%;
  border-radius: 8px;
}

.stock-table :deep(th) {
  background-color: #f5f5f5 !important;
  color: #1976d2 !important;
  font-size: 1rem !important;
  padding: 16px !important;
}

.stock-table :deep(td) {
  padding: 12px 16px !important;
}

.stock-table :deep(tr:hover) {
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


@media (max-width: 600px) {
  .stock-table :deep(th),
  .stock-table :deep(td) {
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
}

@media (max-width: 400px) {
  .stock-table :deep(th),
  .stock-table :deep(td) {
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
  