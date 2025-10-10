import React, { useState, useRef, useEffect } from 'react'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Download, Upload, Settings, Eye } from 'lucide-react'
import './App.css'

function App() {
  // 状态管理
  const [selectedTemplate, setSelectedTemplate] = useState('1x1')
  const [selectedStyle, setSelectedStyle] = useState('professional')
  const [posterConfig, setPosterConfig] = useState({
    storeName: '优选好物',
    storeSlogan: '品质保证·优惠价格',
    bottomText: '长按识别二维码·立即购买',
    qrCode: null,
    primaryColor: '#3B82F6',
    secondaryColor: '#60A5FA'
  })
  const [products, setProducts] = useState([
    { id: 1, title: '优质苹果', spec: '500g/袋', productionDate: '2024-07-15', originalPrice: '29.90', price: '19.90', image: null }
  ])
  const [showImport, setShowImport] = useState(false)
  const [csvData, setCsvData] = useState('')
  const [importError, setImportError] = useState('')
  
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)

  // 模板配置
  const templates = {
    '1x1': { layout: '1x1', name: '单商品模板 (1个商品)', maxProducts: 1, cols: 1, rows: 1 },
    '1x2': { layout: '1x2', name: '双商品模板 (2个商品)', maxProducts: 2, cols: 1, rows: 2 },
    '1x3': { layout: '1x3', name: '三商品模板 (3个商品)', maxProducts: 3, cols: 1, rows: 3 },
    '2x2': { layout: '2x2', name: '四商品模板 (4个商品)', maxProducts: 4, cols: 2, rows: 2 },
    '2x3': { layout: '2x3', name: '六商品模板 (6个商品)', maxProducts: 6, cols: 2, rows: 3 },
    '3x3': { layout: '3x3', name: '九商品模板 (9个商品)', maxProducts: 9, cols: 3, rows: 3 }
  }

  // 整体风格模板
  const styleTemplates = {
    professional: {
      name: '专业商务风 - 沉稳大气，高端品质感',
      primaryColor: '#1E40AF',
      secondaryColor: '#3B82F6',
      backgroundColor: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
      textColor: '#FFFFFF'
    },
    fresh: {
      name: '清新活力风 - 年轻时尚，充满活力',
      primaryColor: '#10B981',
      secondaryColor: '#34D399',
      backgroundColor: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
      textColor: '#FFFFFF'
    },
    warm: {
      name: '温馨家居风 - 温暖舒适，贴近生活',
      primaryColor: '#F59E0B',
      secondaryColor: '#FBBF24',
      backgroundColor: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
      textColor: '#FFFFFF'
    },
    elegant: {
      name: '优雅简约风 - 简洁大方，品味高雅',
      primaryColor: '#8B5CF6',
      secondaryColor: '#A78BFA',
      backgroundColor: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
      textColor: '#FFFFFF'
    },
    vibrant: {
      name: '活力橙色风 - 热情洋溢，充满能量',
      primaryColor: '#EA580C',
      secondaryColor: '#FB923C',
      backgroundColor: 'linear-gradient(135deg, #EA580C 0%, #FB923C 100%)',
      textColor: '#FFFFFF'
    }
  }

  // 基础布局参数 - 根据设计规范V8优化
  const layoutParams = {
    posterWidth: 750,
    headerHeight: 120,
    footerHeight: 80,
    posterPaddingX: 20,
    posterPaddingY: 20,
    productGapX: 15,
    productGapY: 15,
    cardPadding: 12,      // 商品单元外边距
    cardInnerPadding: 8,  // 商品单元内边距
    imageToTextGap: 8,    // 图片与文字间距
    textLineSpacing: 4,   // 文字行间距
    priceGap: 2,          // 价格间距
    bottomPadding: 8      // 底部内边距
  }

  // 计算商品布局 - 根据设计规范V8重构
  const calculateProductLayout = (templateKey) => {
    const template = templates[templateKey]
    const { cols, rows } = template
    const { posterWidth, headerHeight, footerHeight, posterPaddingX, posterPaddingY, productGapX, productGapY, cardInnerPadding, imageToTextGap, textLineSpacing, priceGap, bottomPadding } = layoutParams

    // 计算商品展示区域尺寸
    const productAreaWidth = posterWidth - 2 * posterPaddingX
    const productAreaHeight = 600 // 固定商品区域高度，确保布局稳定

    // 计算单个商品卡片尺寸
    const cardWidth = (productAreaWidth - (cols - 1) * productGapX) / cols
    const cardHeight = (productAreaHeight - (rows - 1) * productGapY) / rows

    // 动态字体大小计算 - 根据设计规范V8优化
    const fontSize = {
      title: Math.max(12, Math.min(16, cardWidth / 20)),
      spec: Math.max(10, Math.min(13, cardWidth / 24)),
      date: Math.max(10, Math.min(12, cardWidth / 26)),
      originalPrice: Math.max(10, Math.min(13, cardWidth / 24)),
      price: Math.max(14, Math.min(18, cardWidth / 18))
    }

    // 计算商品信息区域高度
    const calculateInfoHeight = (product) => {
      let infoHeight = 0
      infoHeight += fontSize.title + textLineSpacing    // 商品名称
      infoHeight += fontSize.spec + textLineSpacing     // 商品规格
      if (product && product.productionDate && product.productionDate.trim() !== '') {
        infoHeight += fontSize.date + textLineSpacing   // 生产日期（按需）
      }
      infoHeight += priceGap                           // 价格区域间距
      infoHeight += fontSize.originalPrice + 2         // 划线价
      infoHeight += fontSize.price                     // 促销价
      return infoHeight
    }

    // 计算商品图片尺寸 - 根据设计规范V8优化，最大化利用空间
    const availableWidth = cardWidth - 2 * cardInnerPadding  // 可用宽度
    const maxInfoHeight = calculateInfoHeight({ productionDate: '2024-01-01' }) // 最大信息高度（包含日期）
    const availableHeight = cardHeight - 2 * cardInnerPadding - imageToTextGap - maxInfoHeight - bottomPadding // 可用图片高度
    
    // 图片尺寸优化：充分利用可用空间，但保持正方形
    const maxImageSize = Math.min(availableWidth, availableHeight)
    const imageSize = Math.max(80, Math.min(maxImageSize, availableWidth * 0.85)) // 最小80px，最大占可用宽度85%

    // 计算海报总高度
    const posterHeight = headerHeight + posterPaddingY + productAreaHeight + posterPaddingY + footerHeight

    return {
      posterHeight,
      cardWidth,
      cardHeight,
      imageSize,
      fontSize,
      cols,
      rows,
      calculateInfoHeight
    }
  }

  // 更新商品数据
  const updateProduct = (index, field, value) => {
    const newProducts = [...products]
    newProducts[index] = { ...newProducts[index], [field]: value }
    setProducts(newProducts)
  }

  // 处理图片上传
  const handleImageUpload = (index, event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        updateProduct(index, 'image', e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // 处理二维码上传
  const handleQRUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPosterConfig(prev => ({ ...prev, qrCode: e.target.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  // 模板切换处理
  const handleTemplateChange = (templateKey) => {
    setSelectedTemplate(templateKey)
    const template = templates[templateKey]
    
    // 调整商品数量
    const currentProductCount = products.length
    const maxProducts = template.maxProducts
    
    if (currentProductCount < maxProducts) {
      // 添加商品
      const newProducts = [...products]
      for (let i = currentProductCount; i < maxProducts; i++) {
        newProducts.push({
          id: i + 1,
          title: `商品${i + 1}`,
          spec: '规格信息',
          productionDate: '2024-07-15',
          originalPrice: '29.90',
          price: '19.90',
          image: null
        })
      }
      setProducts(newProducts)
    } else if (currentProductCount > maxProducts) {
      // 减少商品
      setProducts(products.slice(0, maxProducts))
    }
  }

  // 风格切换处理
  const handleStyleChange = (styleKey) => {
    setSelectedStyle(styleKey)
    const style = styleTemplates[styleKey]
    setPosterConfig(prev => ({
      ...prev,
      primaryColor: style.primaryColor,
      secondaryColor: style.secondaryColor
    }))
  }

  // CSV导入处理
  const handleImportCSV = () => {
    try {
      setImportError('')
      const lines = csvData.trim().split('\\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        throw new Error('CSV数据格式错误，至少需要标题行和一行数据')
      }

      const headers = lines[0].split(',').map(h => h.trim())
      const expectedHeaders = ['商品标题', '商品规格', '生产日期', '划线价', '促销价', '商品图片链接']
      
      if (!expectedHeaders.every(h => headers.includes(h))) {
        throw new Error(`CSV标题行格式错误，应包含：${expectedHeaders.join(', ')}`)
      }

      const newProducts = []
      for (let i = 1; i < lines.length && newProducts.length < templates[selectedTemplate].maxProducts; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        if (values.length >= 5) {
          const product = {
            id: newProducts.length + 1,
            title: values[headers.indexOf('商品标题')] || `商品${newProducts.length + 1}`,
            spec: values[headers.indexOf('商品规格')] || '规格信息',
            productionDate: values[headers.indexOf('生产日期')] || '',
            originalPrice: values[headers.indexOf('划线价')] || '0.00',
            price: values[headers.indexOf('促销价')] || '0.00',
            image: null
          }

          // 处理图片链接
          const imageUrlIndex = headers.indexOf('商品图片链接')
          if (imageUrlIndex !== -1 && values[imageUrlIndex]) {
            const imageUrl = values[imageUrlIndex]
            if (imageUrl.startsWith('http')) {
              product.image = imageUrl
            }
          }

          newProducts.push(product)
        }
      }

      if (newProducts.length > 0) {
        setProducts(newProducts)
        setShowImport(false)
        setCsvData('')
      } else {
        throw new Error('未能解析到有效的商品数据')
      }
    } catch (error) {
      setImportError(error.message)
    }
  }

  // 绘制海报
  const drawPoster = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const layout = calculateProductLayout(selectedTemplate)
    const style = styleTemplates[selectedStyle]

    // 设置画布尺寸
    canvas.width = layoutParams.posterWidth
    canvas.height = layout.posterHeight

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 绘制背景
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 绘制头部区域
    drawHeader(ctx, style)

    // 绘制商品区域
    drawProducts(ctx, layout, style)

    // 绘制底部区域
    drawFooter(ctx, layout.posterHeight)
  }

  // 绘制头部
  const drawHeader = (ctx, style) => {
    const { posterWidth, headerHeight } = layoutParams

    // 创建渐变背景
    const gradient = ctx.createLinearGradient(0, 0, posterWidth, headerHeight)
    gradient.addColorStop(0, style.primaryColor)
    gradient.addColorStop(1, style.secondaryColor)
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, posterWidth, headerHeight)

    // 绘制店铺名称
    ctx.fillStyle = style.textColor
    ctx.font = 'bold 36px Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(posterConfig.storeName, posterWidth / 2, 60)

    // 绘制店铺标语
    ctx.font = '20px Arial, sans-serif'
    ctx.fillText(posterConfig.storeSlogan, posterWidth / 2, 100)
  }

  // 绘制商品区域 - 根据设计规范V8重构
  const drawProducts = (ctx, layout, style) => {
    const { posterWidth, headerHeight, posterPaddingX, posterPaddingY, productGapX, productGapY, cardInnerPadding, imageToTextGap, textLineSpacing, priceGap, bottomPadding } = layoutParams
    const { cardWidth, cardHeight, imageSize, fontSize, cols, rows } = layout

    // 计算商品展示区域的起始位置
    const productAreaStartY = headerHeight + posterPaddingY
    const productAreaStartX = posterPaddingX

    products.slice(0, templates[selectedTemplate].maxProducts).forEach((product, index) => {
      // 计算商品卡片位置
      const row = Math.floor(index / cols)
      const col = index % cols
      
      const cardX = productAreaStartX + col * (cardWidth + productGapX)
      const cardY = productAreaStartY + row * (cardHeight + productGapY)

      // 绘制商品卡片背景
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(cardX, cardY, cardWidth, cardHeight)
      
      // 绘制商品卡片边框
      ctx.strokeStyle = '#E5E7EB'
      ctx.lineWidth = 1
      ctx.strokeRect(cardX, cardY, cardWidth, cardHeight)

      // 计算内容区域 - 根据设计规范V8优化
      const contentX = cardX + cardInnerPadding
      const contentY = cardY + cardInnerPadding
      const contentWidth = cardWidth - 2 * cardInnerPadding
      const contentHeight = cardHeight - 2 * cardInnerPadding

      // 绘制商品图片 - 居中显示，最大化利用空间
      const imageX = contentX + (contentWidth - imageSize) / 2
      const imageY = contentY + 5 // 顶部留少量间距

      if (product.image) {
        if (product.image.startsWith('http')) {
          // 处理URL图片
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => {
            ctx.drawImage(img, imageX, imageY, imageSize, imageSize)
          }
          img.onerror = () => {
            // 绘制占位符
            drawImagePlaceholder(ctx, imageX, imageY, imageSize)
          }
          img.src = product.image
        } else {
          // 处理base64图片
          const img = new Image()
          img.onload = () => {
            ctx.drawImage(img, imageX, imageY, imageSize, imageSize)
          }
          img.src = product.image
        }
      } else {
        // 绘制占位符
        drawImagePlaceholder(ctx, imageX, imageY, imageSize)
      }

      // 绘制商品信息 - 根据设计规范V8优化间距和布局
      let textStartY = imageY + imageSize + imageToTextGap

      // 商品标题
      ctx.fillStyle = '#1F2937'
      ctx.font = `bold ${fontSize.title}px Arial, sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText(product.title, contentX + contentWidth / 2, textStartY)
      textStartY += fontSize.title + textLineSpacing

      // 商品规格
      ctx.fillStyle = '#6B7280'
      ctx.font = `${fontSize.spec}px Arial, sans-serif`
      ctx.fillText(product.spec, contentX + contentWidth / 2, textStartY)
      textStartY += fontSize.spec + textLineSpacing

      // 生产日期（按需显示）
      if (product.productionDate && product.productionDate.trim() !== '') {
        ctx.fillStyle = '#9CA3AF'
        ctx.font = `${fontSize.date}px Arial, sans-serif`
        ctx.fillText(`生产日期: ${product.productionDate}`, contentX + contentWidth / 2, textStartY)
        textStartY += fontSize.date + textLineSpacing
      }

      // 价格信息
      textStartY += priceGap

      // 划线价
      if (product.originalPrice && parseFloat(product.originalPrice) > 0) {
        ctx.fillStyle = '#9CA3AF'
        ctx.font = `${fontSize.originalPrice}px Arial, sans-serif`
        const originalPriceText = `¥${product.originalPrice}`
        const textWidth = ctx.measureText(originalPriceText).width
        const priceX = contentX + (contentWidth - textWidth) / 2
        
        ctx.fillText(originalPriceText, contentX + contentWidth / 2, textStartY)
        
        // 绘制删除线
        ctx.strokeStyle = '#9CA3AF'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(priceX, textStartY - fontSize.originalPrice / 3)
        ctx.lineTo(priceX + textWidth, textStartY - fontSize.originalPrice / 3)
        ctx.stroke()
        
        textStartY += fontSize.originalPrice + 2
      }

      // 促销价
      ctx.fillStyle = '#EF4444'
      ctx.font = `bold ${fontSize.price}px Arial, sans-serif`
      ctx.fillText(`¥${product.price}`, contentX + contentWidth / 2, textStartY)
    })
  }

  // 绘制图片占位符
  const drawImagePlaceholder = (ctx, x, y, size) => {
    ctx.fillStyle = '#F3F4F6'
    ctx.fillRect(x, y, size, size)
    
    ctx.strokeStyle = '#D1D5DB'
    ctx.lineWidth = 1
    ctx.strokeRect(x, y, size, size)
    
    ctx.fillStyle = '#9CA3AF'
    ctx.font = '12px Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('商品图片', x + size / 2, y + size / 2 - 10)
    ctx.fillText('暂未上传', x + size / 2, y + size / 2 + 5)
  }

  // 绘制底部区域
  const drawFooter = (ctx, posterHeight) => {
    const { posterWidth, footerHeight } = layoutParams
    const footerY = posterHeight - footerHeight

    // 绘制二维码
    if (posterConfig.qrCode) {
      const qrSize = 60
      const qrX = posterWidth / 2 - qrSize / 2
      const qrY = footerY + 10
      
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, qrX, qrY, qrSize, qrSize)
      }
      img.src = posterConfig.qrCode
    } else {
      // 绘制二维码占位符
      const qrSize = 60
      const qrX = posterWidth / 2 - qrSize / 2
      const qrY = footerY + 10
      
      ctx.fillStyle = '#F3F4F6'
      ctx.fillRect(qrX, qrY, qrSize, qrSize)
      ctx.strokeStyle = '#D1D5DB'
      ctx.lineWidth = 1
      ctx.strokeRect(qrX, qrY, qrSize, qrSize)
      
      ctx.fillStyle = '#9CA3AF'
      ctx.font = '10px Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('二维码', qrX + qrSize / 2, qrY + qrSize / 2)
    }

    // 绘制底部文字
    ctx.fillStyle = '#374151'
    ctx.font = '14px Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(posterConfig.bottomText, posterWidth / 2, posterHeight - 15)
  }

  // 下载海报
  const downloadPoster = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `海报_${new Date().getTime()}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  // 组件加载时绘制海报
  useEffect(() => {
    const timer = setTimeout(() => {
      drawPoster()
    }, 100)
    return () => clearTimeout(timer)
  }, [selectedTemplate, selectedStyle, posterConfig, products])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">快消品电商海报生成器</h1>
            <p className="text-gray-600 mt-2">专业海报设计，一键生成高质量销售海报</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧配置面板 */}
          <div className="space-y-6">
            {/* 选择整体风格 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  选择整体风格
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedStyle} onValueChange={handleStyleChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(styleTemplates).map(([key, style]) => (
                      <SelectItem key={key} value={key}>
                        {style.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* 选择模板 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  选择模板
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(templates).map(([key, template]) => (
                      <SelectItem key={key} value={key}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* 海报配置 */}
            <Card>
              <CardHeader>
                <CardTitle>海报配置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="storeName">店铺名称</Label>
                  <Input
                    id="storeName"
                    value={posterConfig.storeName}
                    onChange={(e) => setPosterConfig(prev => ({ ...prev, storeName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="storeSlogan">店铺标语</Label>
                  <Input
                    id="storeSlogan"
                    value={posterConfig.storeSlogan}
                    onChange={(e) => setPosterConfig(prev => ({ ...prev, storeSlogan: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="bottomText">底部文字</Label>
                  <Input
                    id="bottomText"
                    value={posterConfig.bottomText}
                    onChange={(e) => setPosterConfig(prev => ({ ...prev, bottomText: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="qrCode">二维码图片</Label>
                  <Input
                    id="qrCode"
                    type="file"
                    accept="image/*"
                    onChange={handleQRUpload}
                  />
                  <p className="text-sm text-gray-500 mt-1">支持 JPG, PNG 格式，最大 2MB</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryColor">主色调</Label>
                    <Input
                      id="primaryColor"
                      type="color"
                      value={posterConfig.primaryColor}
                      onChange={(e) => setPosterConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="secondaryColor">次色调</Label>
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={posterConfig.secondaryColor}
                      onChange={(e) => setPosterConfig(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 商品信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  商品信息
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowImport(!showImport)}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {showImport ? '隐藏导入' : '显示导入'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {showImport && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label htmlFor="csvData">批量导入 (CSV格式)</Label>
                      <textarea
                        id="csvData"
                        className="w-full h-32 p-3 border rounded-md resize-none"
                        placeholder="商品标题,商品规格,生产日期,划线价,促销价,商品图片链接&#10;优质苹果,500g/袋,2024-07-15,29.90,19.90,https://example.com/image.jpg"
                        value={csvData}
                        onChange={(e) => setCsvData(e.target.value)}
                      />
                    </div>
                    {importError && (
                      <div className="text-red-600 text-sm">{importError}</div>
                    )}
                    <Button onClick={handleImportCSV} className="w-full">
                      导入数据
                    </Button>
                  </div>
                )}
                
                {products.slice(0, templates[selectedTemplate].maxProducts).map((product, index) => (
                  <div key={product.id} className="space-y-3 p-4 border rounded-lg">
                    <h4 className="font-medium">商品 {index + 1}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>商品标题</Label>
                        <Input
                          value={product.title}
                          onChange={(e) => updateProduct(index, 'title', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>商品规格</Label>
                        <Input
                          value={product.spec}
                          onChange={(e) => updateProduct(index, 'spec', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>生产日期</Label>
                        <Input
                          value={product.productionDate}
                          onChange={(e) => updateProduct(index, 'productionDate', e.target.value)}
                          placeholder="留空则不显示日期"
                        />
                      </div>
                      <div>
                        <Label>划线价</Label>
                        <Input
                          value={product.originalPrice}
                          onChange={(e) => updateProduct(index, 'originalPrice', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>促销价</Label>
                        <Input
                          value={product.price}
                          onChange={(e) => updateProduct(index, 'price', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>商品图片</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(index, e)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 生成按钮 */}
            <Button onClick={downloadPoster} className="w-full" size="lg">
              <Download className="w-5 h-5 mr-2" />
              生成并下载海报
            </Button>
          </div>

          {/* 右侧预览面板 */}
          <div className="lg:sticky lg:top-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  海报预览
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-auto border border-gray-300 rounded shadow-lg"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

