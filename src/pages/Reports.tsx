import React, { useState, useEffect } from 'react'
import { BarChart3, Package, Edit2, Save, X } from 'lucide-react'

interface ReportData {
  id_receta: number
  id_ingrediente: number
  ingrediente_nombre: string
  presentacion: string
  precio_compra: number
  categoria_nombre: string
  vecesUsado: number
  cantidad_total_usada: number
  costo_total_uso: number
  imagen: string | null
}

export default function Reports() {
  const [reportData, setReportData] = useState<ReportData[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [editValues, setEditValues] = useState({
    cantidad_usada: '',
    costo_uso: ''
  })

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    try {
      const response = await fetch('/api/reports.php?action=getMostUsedIngredients')
      const data = await response.json()
      if (data.success) {
        setReportData(data.data)
      }
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const startEditing = (item: ReportData) => {
    const key = `${item.id_receta}-${item.id_ingrediente}`
    setEditingItem(key)
    setEditValues({
      cantidad_usada: item.cantidad_total_usada.toString(),
      costo_uso: item.costo_total_uso.toString()
    })
  }

  const cancelEditing = () => {
    setEditingItem(null)
    setEditValues({ cantidad_usada: '', costo_uso: '' })
  }

  const saveChanges = async (item: ReportData) => {
    const formData = new FormData()
    formData.append('action', 'updateRecipeIngredient')
    formData.append('id_receta', item.id_receta.toString())
    formData.append('id_ingrediente', item.id_ingrediente.toString())
    formData.append('cantidad_usada', editValues.cantidad_usada)
    formData.append('costo_uso', editValues.costo_uso)

    try {
      const response = await fetch('/api/reports.php', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      if (data.success) {
        fetchReportData()
        setEditingItem(null)
        setEditValues({ cantidad_usada: '', costo_uso: '' })
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Error updating ingredient:', error)
      alert('Error al actualizar el ingrediente')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <BarChart3 className="h-8 w-8 text-primary-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reportes</h2>
          <p className="mt-2 text-gray-600">
            Análisis de ingredientes más utilizados en recetas
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Ingredientes</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(reportData.map(item => item.id_ingrediente)).size}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Usos Totales</p>
              <p className="text-2xl font-bold text-gray-900">
                {reportData.reduce((sum, item) => sum + item.vecesUsado, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Costo Total</p>
              <p className="text-2xl font-bold text-gray-900">
                ${reportData.reduce((sum, item) => sum + item.costo_total_uso, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ingrediente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Veces Usado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Costo Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio Compra
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.map((item) => {
                const key = `${item.id_receta}-${item.id_ingrediente}`
                const isEditing = editingItem === key
                
                return (
                  <tr key={key} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        {item.imagen ? (
                          <img
                            src={`/uploads/ingredientes/${item.imagen}`}
                            alt={item.ingrediente_nombre}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {item.ingrediente_nombre}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.presentacion}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {item.categoria_nombre || 'Sin categoría'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.vecesUsado}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editValues.cantidad_usada}
                          onChange={(e) => setEditValues({
                            ...editValues,
                            cantidad_usada: e.target.value
                          })}
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      ) : (
                        item.cantidad_total_usada
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editValues.costo_uso}
                          onChange={(e) => setEditValues({
                            ...editValues,
                            costo_uso: e.target.value
                          })}
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      ) : (
                        `$${item.costo_total_uso.toFixed(2)}`
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${item.precio_compra.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {isEditing ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveChanges(item)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(item)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {reportData.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay datos</h3>
          <p className="mt-1 text-sm text-gray-500">
            No se encontraron datos de ingredientes utilizados en recetas.
          </p>
        </div>
      )}
    </div>
  )
}