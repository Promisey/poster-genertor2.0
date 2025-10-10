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
    posterTitle: '', // 新增：海报标题
    headerImage: null, // 新增：顶部宣传图片
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
  const headerImageInputRef = useRef(null)
  const qrCodeInputRef = useRef(null)

  // 模板配置 - 根据新需求重构
  const templates = {
    '1x1': { layout: '1x1', name: '单商品模板 (1个商品)', maxProducts: 1 },
    '1x2': { layout: '1x2', name: '双商品模板 (2个商品)', maxProducts: 2 },
    '1x3': { layout: '1x3', name: '三商品模板 (3个商品)', maxProducts: 3 },
    '2x2': { layout: '2x2', name: '四商品模板 (4个商品)', maxProducts: 4 },
    '2x3': { layout: '2x3', name: '六商品模板 (6个商品)', maxProducts: 6 },
    '3x3': { layout: '3x3', name: '九商品模板 (9个商品)', maxProducts: 9 },
    '3x5': { layout: '3x5', name: '十五商品模板 (15个商品)', maxProducts: 15 },
    '3x8': { layout: '3x8', name: '二十四商品模板 (24个商品)', maxProducts: 24 }
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

  // 基础布局参数 - 根据新需求调整
  const layoutParams = {
    posterWidth: 375, // 固定宽度375px
    baseHeaderHeight: 80, // 基础头部高度
    baseFooterHeight: 80, // 基础底部高度
    posterPaddingX: 15, // 左右内边距
    posterPaddingY: 15, // 上下内边距
    productGapX: 10, // 商品水平间距
    productGapY: 10, // 商品垂直间距
    cardPadding: 8, // 商品卡片外边距
    cardInnerPadding: 8, // 商品卡片内边距
    imageToTextGap: 8, // 图片与文字间距
    textLineSpacing: 4, // 文字行间距
    priceGap: 2, // 价格间距
    bottomPadding: 8 // 底部内边距
  }

  // 计算商品布局 - 根据新需求完全重构
  const calculateProductLayout = (templateKey) => {
    const template = templates[templateKey]
    const maxProducts = template.maxProducts
    const { posterWidth, baseHeaderHeight, baseFooterHeight, posterPaddingX, posterPaddingY, productGapX, productGapY, cardInnerPadding, imageToTextGap, textLineSpacing, priceGap, bottomPadding } = layoutParams

    // 根据商品数量动态确定列数和行数
    let cols, rows
    if (maxProducts === 1) {
      cols = 1
      rows = 1
    } else if (maxProducts <= 3) {
      cols = 1
      rows = maxProducts
    } else if (maxProducts === 4) {
      cols = 2
      rows = 2
    } else {
      cols = 3
      rows = Math.ceil(maxProducts / 3)
    }

    // 计算商品展示区域宽度
    const productAreaWidth = posterWidth - 2 * posterPaddingX

    // 计算单个商品卡片宽度
    const cardWidth = (productAreaWidth - (cols - 1) * productGapX) / cols

    // 动态字体大小计算
    const fontSize = {
      title: Math.max(10, Math.min(14, cardWidth / 20)),
      spec: Math.max(8, Math.min(12, cardWidth / 24)),
      date: Math.max(8, Math.min(10, cardWidth / 26)),
      originalPrice: Math.max(8, Math.min(11, cardWidth / 24)),
      price: Math.max(12, Math.min(16, cardWidth / 18))
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

    // 计算商品图片尺寸（正方形）
    const availableWidth = cardWidth - 2 * cardInnerPadding
    const maxInfoHeight = calculateInfoHeight({ productionDate: '2024-01-01' })
    
    // 图片尺寸：确保为正方形，并充分利用可用宽度
    const imageSize = Math.max(60, Math.min(availableWidth * 0.9, availableWidth))

    // 计算商品卡片高度：图片高度 + 信息高度 + 间距 + 内边距
    const cardHeight = 2 * cardInnerPadding + imageSize + imageToTextGap + maxInfoHeight + bottomPadding

    // 计算商品区域总高度
    const productAreaHeight = rows * cardHeight + (rows - 1) * productGapY

    // 计算头部高度（包含宣传图和标题）
    let headerHeight = baseHeaderHeight
    if (posterConfig.headerImage) {
      headerHeight += 100 // 宣传图片高度
    }
    if (posterConfig.posterTitle && posterConfig.posterTitle.trim() !== '') {
      headerHeight += 40 // 标题高度
    }

    // 计算海报总高度
    const posterHeight = headerHeight + posterPaddingY + productAreaHeight + posterPaddingY + baseFooterHeight

    return {
      posterHeight,
      headerHeight,
      productAreaHeight,
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

  // 处理顶部宣传图片上传
  const handleHeaderImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPosterConfig(prev => ({ ...prev, headerImage: e.target.result }))
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
      const lines = csvData.trim().split('\n').filter(line => line.trim())
      
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
    drawHeader(ctx, style, layout.headerHeight)

    // 绘制商品区域
    drawProducts(ctx, layout, style)

    // 绘制底部区域
    drawFooter(ctx, layout.posterHeight)
  }

  // 绘制头部 - 支持宣传图片和标题
  const drawHeader = (ctx, style, headerHeight) => {
    const { posterWidth } = layoutParams
    let currentY = 0

    // 绘制宣传图片
    if (posterConfig.headerImage) {
      const headerImageHeight = 100
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, currentY, posterWidth, headerImageHeight)
      }
      img.src = posterConfig.headerImage
      currentY += headerImageHeight
    }

    // 绘制渐变背景（店铺信息区域）
    const gradientHeight = layoutParams.baseHeaderHeight
    const gradient = ctx.createLinearGradient(0, currentY, posterWidth, currentY + gradientHeight)
    gradient.addColorStop(0, style.primaryColor)
    gradient.addColorStop(1, style.secondaryColor)
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, currentY, posterWidth, gradientHeight)

    // 绘制店铺名称
    ctx.fillStyle = style.textColor
    ctx.font = 'bold 24px Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(posterConfig.storeName, posterWidth / 2, currentY + 35)

    // 绘制店铺标语
    ctx.font = '14px Arial, sans-serif'
    ctx.fillText(posterConfig.storeSlogan, posterWidth / 2, currentY + 60)

    currentY += gradientHeight

    // 绘制海报标题
    if (posterConfig.posterTitle && posterConfig.posterTitle.trim() !== '') {
      const titleHeight = 40
      ctx.fillStyle = '#1F2937'
      ctx.font = 'bold 18px Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(posterConfig.posterTitle, posterWidth / 2, currentY + 25)
      currentY += titleHeight
    }
  }

  // 绘制商品区域 - 根据新布局规则重构
  const drawProducts = (ctx, layout, style) => {
    const { posterWidth, posterPaddingX, posterPaddingY, productGapX, productGapY, cardInnerPadding, imageToTextGap, textLineSpacing, priceGap, bottomPadding } = layoutParams
    const { headerHeight, cardWidth, cardHeight, imageSize, fontSize, cols, rows } = layout

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

      // 计算内容区域
      const contentX = cardX + cardInnerPadding
      const contentY = cardY + cardInnerPadding
      const contentWidth = cardWidth - 2 * cardInnerPadding

      // 绘制商品图片（正方形，居中显示）
      const imageX = contentX + (contentWidth - imageSize) / 2
      const imageY = contentY + 5

      if (product.image) {
        if (product.image.startsWith('http')) {
          // 处理URL图片
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => {
            ctx.drawImage(img, imageX, imageY, imageSize, imageSize)
          }
          img.onerror = () => {
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
        drawImagePlaceholder(ctx, imageX, imageY, imageSize)
      }

      // 绘制商品信息
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
    ctx.font = '10px Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('商品图片', x + size / 2, y + size / 2 - 5)
    ctx.fillText('暂未上传', x + size / 2, y + size / 2 + 8)
  }

  // 绘制底部区域
  const drawFooter = (ctx, posterHeight) => {
    const { posterWidth, baseFooterHeight } = layoutParams
    const footerY = posterHeight - baseFooterHeight

    // 绘制二维码
    if (posterConfig.qrCode) {
      const qrSize = 50
      const qrX = posterWidth / 2 - qrSize / 2
      const qrY = footerY + 10
      
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, qrX, qrY, qrSize, qrSize)
      }
      img.src = posterConfig.qrCode
    } else {
      // 绘制二维码占位符
      const qrSize = 50
      const qrX = posterWidth / 2 - qrSize / 2
      const qrY = footerY + 10
      
      ctx.fillStyle = '#F3F4F6'
      ctx.fillRect(qrX, qrY, qrSize, qrSize)
      ctx.strokeStyle = '#D1D5DB'
      ctx.lineWidth = 1
      ctx.strokeRect(qrX, qrY, qrSize, qrSize)
      
      ctx.fillStyle = '#9CA3AF'
      ctx.font = '8px Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('二维码', qrX + qrSize / 2, qrY + qrSize / 2)
    }

    // 绘制底部文字
    ctx.fillStyle = '#6B7280'
    ctx.font = '12px Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(posterConfig.bottomText, posterWidth / 2, footerY + 75)
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

  // 监听状态变化，自动重绘海报
  useEffect(() => {
    drawPoster()
  }, [selectedTemplate, selectedStyle, posterConfig, products])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">快消品电商海报生成器</h1>
          <p className="text-gray-600">专业的商品海报制作工具，支持多种模板和风格</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧控制面板 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 模板选择 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  模板选择
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="template">选择模板</Label>
                    <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择模板" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(templates).map(([key, template]) => (
                          <SelectItem key={key} value={key}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="style">选择风格</Label>
                    <Select value={selectedStyle} onValueChange={handleStyleChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择风格" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(styleTemplates).map(([key, style]) => (
                          <SelectItem key={key} value={key}>
                            {style.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 海报配置 */}
            <Card>
              <CardHeader>
                <CardTitle>海报配置</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="storeName">店铺名称</Label>
                    <Input
                      id="storeName"
                      value={posterConfig.storeName}
                      onChange={(e) => setPosterConfig(prev => ({ ...prev, storeName: e.target.value }))}
                      placeholder="请输入店铺名称"
                    />
                  </div>

                  <div>
                    <Label htmlFor="storeSlogan">店铺标语</Label>
                    <Input
                      id="storeSlogan"
                      value={posterConfig.storeSlogan}
                      onChange={(e) => setPosterConfig(prev => ({ ...prev, storeSlogan: e.target.value }))}
                      placeholder="请输入店铺标语"
                    />
                  </div>

                  <div>
                    <Label htmlFor="posterTitle">海报标题（可选）</Label>
                    <Input
                      id="posterTitle"
                      value={posterConfig.posterTitle}
                      onChange={(e) => setPosterConfig(prev => ({ ...prev, posterTitle: e.target.value }))}
                      placeholder="请输入海报标题"
                    />
                  </div>

                  <div>
                    <Label htmlFor="headerImage">顶部宣传图片（可选）</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => headerImageInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        上传宣传图片
                      </Button>
                      {posterConfig.headerImage && (
                        <Button
                          variant="outline"
                          onClick={() => setPosterConfig(prev => ({ ...prev, headerImage: null }))}
                        >
                          清除
                        </Button>
                      )}
                    </div>
                    <input
                      ref={headerImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleHeaderImageUpload}
                      className="hidden"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bottomText">底部文字</Label>
                    <Input
                      id="bottomText"
                      value={posterConfig.bottomText}
                      onChange={(e) => setPosterConfig(prev => ({ ...prev, bottomText: e.target.value }))}
                      placeholder="请输入底部文字"
                    />
                  </div>

                  <div>
                    <Label htmlFor="qrCode">二维码（可选）</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => qrCodeInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        上传二维码
                      </Button>
                      {posterConfig.qrCode && (
                        <Button
                          variant="outline"
                          onClick={() => setPosterConfig(prev => ({ ...prev, qrCode: null }))}
                        >
                          清除
                        </Button>
                      )}
                    </div>
                    <input
                      ref={qrCodeInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleQRUpload}
                      className="hidden"
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
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowImport(!showImport)}
                    >
                      批量导入
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showImport && (
                  <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                    <Label htmlFor="csvData">CSV数据导入</Label>
                    <p className="text-sm text-gray-600 mb-2">
                      请按以下格式输入CSV数据：商品标题,商品规格,生产日期,划线价,促销价,商品图片链接
                    </p>
                    <textarea
                      id="csvData"
                      value={csvData}
                      onChange={(e) => setCsvData(e.target.value)}
                      placeholder="商品标题,商品规格,生产日期,划线价,促销价,商品图片链接&#10;优质苹果,500g/袋,2024-07-15,29.90,19.90,https://example.com/apple.jpg"
                      className="w-full h-32 p-2 border rounded resize-none"
                    />
                    {importError && (
                      <p className="text-red-500 text-sm mt-2">{importError}</p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <Button onClick={handleImportCSV} size="sm">
                        导入数据
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowImport(false)
                          setCsvData('')
                          setImportError('')
                        }}
                      >
                        取消
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {products.slice(0, templates[selectedTemplate].maxProducts).map((product, index) => (
                    <div key={product.id} className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-3">商品 {index + 1}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`title-${index}`}>商品标题</Label>
                          <Input
                            id={`title-${index}`}
                            value={product.title}
                            onChange={(e) => updateProduct(index, 'title', e.target.value)}
                            placeholder="请输入商品标题"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`spec-${index}`}>商品规格</Label>
                          <Input
                            id={`spec-${index}`}
                            value={product.spec}
                            onChange={(e) => updateProduct(index, 'spec', e.target.value)}
                            placeholder="请输入商品规格"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`date-${index}`}>生产日期（可选）</Label>
                          <Input
                            id={`date-${index}`}
                            value={product.productionDate}
                            onChange={(e) => updateProduct(index, 'productionDate', e.target.value)}
                            placeholder="YYYY-MM-DD"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`originalPrice-${index}`}>划线价</Label>
                          <Input
                            id={`originalPrice-${index}`}
                            value={product.originalPrice}
                            onChange={(e) => updateProduct(index, 'originalPrice', e.target.value)}
                            placeholder="0.00"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`price-${index}`}>促销价</Label>
                          <Input
                            id={`price-${index}`}
                            value={product.price}
                            onChange={(e) => updateProduct(index, 'price', e.target.value)}
                            placeholder="0.00"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`image-${index}`}>商品图片</Label>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => fileInputRef.current?.click()}
                              className="flex items-center gap-2"
                            >
                              <Upload className="w-4 h-4" />
                              上传图片
                            </Button>
                            {product.image && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateProduct(index, 'image', null)}
                              >
                                清除
                              </Button>
                            )}
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(index, e)}
                            className="hidden"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧预览区域 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    海报预览
                  </span>
                  <Button onClick={downloadPoster} className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    下载海报
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden bg-white" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  <canvas
                    ref={canvasRef}
                    className="w-full h-auto"
                    style={{ display: 'block' }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2 text-center">
                  预览区域可滚动查看完整海报
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

