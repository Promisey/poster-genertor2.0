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

  // 模板配置 - 根据设计规范V7重新设计
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
      name: '清新自然风 - 绿色环保，健康生活',
      primaryColor: '#059669',
      secondaryColor: '#10B981',
      backgroundColor: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
      textColor: '#FFFFFF'
    },
    fashion: {
      name: '时尚潮流风 - 活力四射，年轻时尚',
      primaryColor: '#DC2626',
      secondaryColor: '#EF4444',
      backgroundColor: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
      textColor: '#FFFFFF'
    },
    warm: {
      name: '温馨生活风 - 温暖舒适，家庭氛围',
      primaryColor: '#D97706',
      secondaryColor: '#F59E0B',
      backgroundColor: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
      textColor: '#FFFFFF'
    },
    classic: {
      name: '经典复古风 - 典雅怀旧，品味独特',
      primaryColor: '#7C2D12',
      secondaryColor: '#DC2626',
      backgroundColor: 'linear-gradient(135deg, #7C2D12 0%, #DC2626 100%)',
      textColor: '#FFFFFF'
    }
  }

  // 全局布局参数 - 根据设计规范V7
  const layoutParams = {
    posterWidth: 750,
    headerHeight: 150,
    footerHeight: 280,
    posterPaddingX: 30,
    posterPaddingY: 30,
    productGapX: 20,
    productGapY: 20,
    cardPadding: 6,
    imageToTextGap: 12,
    textLineSpacing: 3,
    priceGap: 6
  }

  // 计算商品布局 - 重构版本
  const calculateProductLayout = (templateKey) => {
    const template = templates[templateKey]
    const { cols, rows } = template
    const { posterWidth, headerHeight, footerHeight, posterPaddingX, posterPaddingY, productGapX, productGapY } = layoutParams

    // 计算商品展示区域的总高度
    const productAreaHeight = Math.max(600, rows * 200 + (rows - 1) * productGapY + 2 * posterPaddingY)
    
    // 计算海报总高度
    const posterHeight = headerHeight + productAreaHeight + footerHeight

    // 计算每个商品卡片的尺寸
    const cardWidth = (posterWidth - 2 * posterPaddingX - (cols - 1) * productGapX) / cols
    const cardHeight = (productAreaHeight - 2 * posterPaddingY - (rows - 1) * productGapY) / rows

    // 计算图片尺寸
    const imageSize = Math.max(100, Math.min(cardWidth * 0.6, cardHeight * 0.5))

    // 字体大小自适应
    const fontSize = {
      title: Math.max(12, Math.min(16, cardWidth / 20)),
      spec: Math.max(10, Math.min(13, cardWidth / 24)),
      date: Math.max(10, Math.min(12, cardWidth / 26)),
      price: Math.max(14, Math.min(18, cardWidth / 18))
    }

    return {
      posterHeight,
      productAreaHeight,
      cardWidth,
      cardHeight,
      imageSize,
      fontSize,
      cols,
      rows
    }
  }

  // 更新商品数量
  const updateProductsForTemplate = (templateKey) => {
    const template = templates[templateKey]
    const currentProducts = [...products]
    
    if (currentProducts.length < template.maxProducts) {
      // 添加商品
      for (let i = currentProducts.length; i < template.maxProducts; i++) {
        currentProducts.push({
          id: i + 1,
          title: `商品${i + 1}`,
          spec: '规格信息',
          productionDate: '2024-07-15',
          originalPrice: '29.90',
          price: '19.90',
          image: null
        })
      }
    } else if (currentProducts.length > template.maxProducts) {
      // 删除多余商品
      currentProducts.splice(template.maxProducts)
    }
    
    setProducts(currentProducts)
  }

  // 处理模板变更
  const handleTemplateChange = (templateKey) => {
    setSelectedTemplate(templateKey)
    updateProductsForTemplate(templateKey)
  }

  // 处理风格变更
  const handleStyleChange = (styleKey) => {
    setSelectedStyle(styleKey)
    const style = styleTemplates[styleKey]
    setPosterConfig(prev => ({
      ...prev,
      primaryColor: style.primaryColor,
      secondaryColor: style.secondaryColor
    }))
  }

  // 处理商品信息更新
  const updateProduct = (id, field, value) => {
    setProducts(prev => prev.map(product => 
      product.id === id ? { ...product, [field]: value } : product
    ))
  }

  // 处理图片上传
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target.result;
        const lines = csv.split('\n').filter(line => line.trim() !== ''); // 移除空行
        if (lines.length < 2) {
          alert('CSV文件为空或格式不正确，需要包含表头和至少一行数据。');
          return;
        }
        
        const firstProductLine = lines[1];
        const values = firstProductLine.split(',');

        if (values.length < 5) { // name, spec, productionDate, originalPrice, price
          alert('CSV文件中的数据列数不足。');
          return;
        }

        const [name, spec, productionDate, originalPrice, price, imageUrl] = values;
        
        setProductInfo({
          name: name || '优质苹果',
          spec: spec || '500g/袋',
          productionDate: productionDate || new Date().toISOString().slice(0, 10),
          originalPrice: originalPrice || '29.90',
          price: price || '19.90',
          imageUrl: imageUrl || defaultImage,
        });
        alert('商品信息导入成功！');
      } catch (error) {
        console.error("导入失败:", error);
        alert('文件处理失败，请检查文件格式是否正确。');
      }
    };
    reader.onerror = () => {
      alert('读取文件失败。');
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        updateProduct(productId, 'image', e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // 处理CSV导入
  const handleCSVImport = () => {
    try {
      setImportError('')
      const lines = csvData.trim().split('\n')
      if (lines.length < 2) {
        throw new Error('CSV数据格式错误，至少需要标题行和一行数据')
      }

      // 更健壮的CSV解析，处理包含逗号的字段
      const parseCSVLine = (line) => {
        const result = []
        let inQuote = false
        let field = ''
        for (let i = 0; i < line.length; i++) {
          const char = line[i]
          if (char === '"') {
            inQuote = !inQuote
          } else if (char === ',' && !inQuote) {
            result.push(field.trim())
            field = ''
          } else {
            field += char
          }
        }
        result.push(field.trim())
        return result
      }

      const headers = parseCSVLine(lines[0])
      const expectedHeaders = ['商品标题', '商品规格', '生产日期', '划线价', '促销价', '商品图片链接']
      
      if (!expectedHeaders.every(h => headers.includes(h))) {
        throw new Error(`CSV标题行格式错误，应包含：${expectedHeaders.join(', ')}`)
      }

      const newProducts = []
      for (let i = 1; i < lines.length && newProducts.length < templates[selectedTemplate].maxProducts; i++) {
        const values = parseCSVLine(lines[i])
        // 确保values数组有足够的长度，避免访问越界
        if (values.length >= expectedHeaders.length) {
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

  // 绘制商品区域 - 重构版本
  const drawProducts = (ctx, layout, style) => {
    const { posterWidth, headerHeight, posterPaddingX, posterPaddingY, productGapX, productGapY, cardPadding, imageToTextGap, textLineSpacing, priceGap } = layoutParams
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

      // 计算内容区域
      const contentX = cardX + cardPadding
      const contentY = cardY + cardPadding
      const contentWidth = cardWidth - 2 * cardPadding
      const contentHeight = cardHeight - 2 * cardPadding

      // 绘制商品图片
      const imageX = contentX + (contentWidth - imageSize) / 2
      const imageY = contentY + 10

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

      // 绘制商品信息
      let textStartY = imageY + imageSize + imageToTextGap

      // 商品标题 - 使用换行处理
      ctx.fillStyle = '#1F2937'
      ctx.font = `bold ${fontSize.title}px Arial, sans-serif`
      ctx.textAlign = 'center'
      const titleHeight = drawWrappedText(
        ctx, 
        product.title, 
        contentX + contentWidth / 2, 
        textStartY, 
        contentWidth * 0.9, // 留一些边距
        fontSize.title + 2, // 行高
        2 // 最多2行
      )
      textStartY += titleHeight + textLineSpacing

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
        ctx.font = `${fontSize.price - 2}px Arial, sans-serif`
        const originalPriceText = `¥${product.originalPrice}`
        const textWidth = ctx.measureText(originalPriceText).width
        const priceX = contentX + (contentWidth - textWidth) / 2
        
        ctx.fillText(originalPriceText, contentX + contentWidth / 2, textStartY)
        
        // 绘制删除线
        ctx.strokeStyle = '#9CA3AF'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(priceX, textStartY - fontSize.price / 3)
        ctx.lineTo(priceX + textWidth, textStartY - fontSize.price / 3)
        ctx.stroke()
        
        textStartY += fontSize.price + textLineSpacing
      }

      // 促销价
      ctx.fillStyle = '#DC2626'
      ctx.font = `bold ${fontSize.price}px Arial, sans-serif`
      ctx.fillText(`¥${product.price}`, contentX + contentWidth / 2, textStartY)
    })
  }

  // 文本处理函数 - 处理长文本换行或截断
  const drawWrappedText = (ctx, text, x, y, maxWidth, lineHeight, maxLines = 2) => {
    const words = text.split('')
    let line = ''
    let lines = []
    let currentY = y

    // 测量文本宽度
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i]
      const metrics = ctx.measureText(testLine)
      const testWidth = metrics.width

      if (testWidth > maxWidth && line !== '') {
        lines.push(line)
        line = words[i]
      } else {
        line = testLine
      }
    }
    lines.push(line)

    // 如果超过最大行数，截断并添加省略号
    if (lines.length > maxLines) {
      lines = lines.slice(0, maxLines)
      const lastLine = lines[maxLines - 1]
      let truncatedLine = lastLine
      
      // 逐步减少字符直到能容纳省略号
      while (ctx.measureText(truncatedLine + '...').width > maxWidth && truncatedLine.length > 0) {
        truncatedLine = truncatedLine.slice(0, -1)
      }
      lines[maxLines - 1] = truncatedLine + '...'
    }

    // 绘制每一行
    lines.forEach((line, index) => {
      ctx.fillText(line, x, currentY + index * lineHeight)
    })

    // 返回实际使用的高度
    return lines.length * lineHeight
  }

  // 绘制图片占位符
  const drawImagePlaceholder = (ctx, x, y, size) => {
    ctx.fillStyle = '#F3F4F6'
    ctx.fillRect(x, y, size, size)
    
    ctx.strokeStyle = '#D1D5DB'
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, size, size)
    
    ctx.fillStyle = '#9CA3AF'
    ctx.font = '14px Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('商品图片', x + size / 2, y + size / 2 - 10)
    ctx.fillText('暂未上传', x + size / 2, y + size / 2 + 10)
  }

  // 绘制底部
  const drawFooter = (ctx, posterHeight) => {
    const { posterWidth, footerHeight } = layoutParams
    const footerStartY = posterHeight - footerHeight

    // 绘制底部背景
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, footerStartY, posterWidth, footerHeight)

    // 绘制分隔线
    ctx.strokeStyle = '#E5E7EB'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(50, footerStartY + 20)
    ctx.lineTo(posterWidth - 50, footerStartY + 20)
    ctx.stroke()

    // 绘制二维码占位符
    const qrSize = 120
    const qrX = posterWidth / 2 - qrSize / 2
    const qrY = footerStartY + 60

    if (posterConfig.qrCode) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, qrX, qrY, qrSize, qrSize)
      }
      img.src = posterConfig.qrCode
    } else {
      ctx.fillStyle = '#F3F4F6'
      ctx.fillRect(qrX, qrY, qrSize, qrSize)
      
      ctx.strokeStyle = '#D1D5DB'
      ctx.lineWidth = 2
      ctx.strokeRect(qrX, qrY, qrSize, qrSize)
      
      ctx.fillStyle = '#9CA3AF'
      ctx.font = '14px Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('二维码', qrX + qrSize / 2, qrY + qrSize / 2)
    }

    // 绘制底部文字
    ctx.fillStyle = '#374151'
    ctx.font = '18px Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(posterConfig.bottomText, posterWidth / 2, qrY + qrSize + 40)
  }

  // 下载海报
  const downloadPoster = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `海报_${templates[selectedTemplate].name}_${Date.now()}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  // 监听状态变化，重新绘制海报
  useEffect(() => {
    const timer = setTimeout(() => {
      drawPoster()
    }, 100)
    return () => clearTimeout(timer)
  }, [selectedTemplate, selectedStyle, posterConfig, products])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 text-center">快消品电商海报生成器</h1>
          <p className="text-gray-600 text-center mt-2">专业海报设计，一键生成高质量销售海报</p>
        </div>
      </header>

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
                    onChange={(e) => {
                      const file = e.target.files[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (e) => {
                          setPosterConfig(prev => ({ ...prev, qrCode: e.target.result }))
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
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

            {/* 批量导入 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  批量导入商品信息
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setShowImport(!showImport)}
                  variant="outline"
                  className="w-full"
                >
                  {showImport ? '隐藏导入' : '显示导入'}
                </Button>
                
                {showImport && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <Label htmlFor="csvData">CSV数据</Label>
                      <textarea
                        id="csvData"
                        className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none"
                        placeholder="商品标题,商品规格,生产日期,划线价,促销价,商品图片链接&#10;优质苹果,500g/袋,2024-07-15,29.90,19.90,https://example.com/image.jpg"
                        value={csvData}
                        onChange={(e) => setCsvData(e.target.value)}
                      />
                    </div>
                    {importError && (
                      <div className="text-red-600 text-sm">{importError}</div>
                    )}
                    <Button onClick={handleCSVImport} className="w-full">
                      导入数据
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 商品信息配置 */}
            <div className="space-y-4">
              {products.slice(0, templates[selectedTemplate].maxProducts).map((product, index) => (
                <Card key={product.id}>
                  <CardHeader>
                    <CardTitle>商品 {index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>商品标题</Label>
                      <Input
                        value={product.title}
                        onChange={(e) => updateProduct(product.id, 'title', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>商品规格</Label>
                      <Input
                        value={product.spec}
                        onChange={(e) => updateProduct(product.id, 'spec', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>生产日期</Label>
                      <Input
                        type="date"
                        value={product.productionDate}
                        onChange={(e) => updateProduct(product.id, 'productionDate', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>划线价</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={product.originalPrice}
                          onChange={(e) => updateProduct(product.id, 'originalPrice', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>促销价</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={product.price}
                          onChange={(e) => updateProduct(product.id, 'price', e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>商品图片</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(product.id, e.target.files[0])}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* 右侧海报预览 */}
          <div className="lg:sticky lg:top-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  海报预览
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center mb-4">
                  <canvas
                    ref={canvasRef}
                    className="border border-gray-300 rounded-lg shadow-lg max-w-full h-auto"
                    style={{ maxHeight: '600px' }}
                  />
                </div>
                <Button onClick={downloadPoster} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  生成并下载海报
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

