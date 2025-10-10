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

  // 模板配置 - 根据设计规范V5精细化调整
  const templates = {
    '1x1': { layout: '1x1', name: '单商品模板 (1个商品)', maxProducts: 1, height: 1100 },
    '1x2': { layout: '1x2', name: '双商品模板 (2个商品)', maxProducts: 2, height: 1300 },
    '1x3': { layout: '1x3', name: '三商品模板 (3个商品)', maxProducts: 3, height: 1500 },
    '2x2': { layout: '2x2', name: '四商品模板 (4个商品)', maxProducts: 4, height: 1550 },
    '2x3': { layout: '2x3', name: '六商品模板 (6个商品)', maxProducts: 6, height: 1800 },
    '3x3': { layout: '3x3', name: '九商品模板 (9个商品)', maxProducts: 9, height: 2000 }
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
      name: '清新自然风 - 明亮活泼，健康自然',
      primaryColor: '#059669',
      secondaryColor: '#10B981',
      backgroundColor: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
      textColor: '#FFFFFF'
    },
    trendy: {
      name: '时尚潮流风 - 年轻动感，色彩鲜明',
      primaryColor: '#DC2626',
      secondaryColor: '#EF4444',
      backgroundColor: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
      textColor: '#FFFFFF'
    },
    warm: {
      name: '温馨生活风 - 温暖舒适，亲和力强',
      primaryColor: '#D97706',
      secondaryColor: '#F59E0B',
      backgroundColor: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
      textColor: '#FFFFFF'
    },
    classic: {
      name: '经典复古风 - 典雅稳重，历久弥新',
      primaryColor: '#7C2D12',
      secondaryColor: '#DC2626',
      backgroundColor: 'linear-gradient(135deg, #7C2D12 0%, #DC2626 100%)',
      textColor: '#FFFFFF'
    }
  }

  // 根据设计规范V5计算海报尺寸
  const calculatePosterDimensions = () => {
    const template = templates[selectedTemplate]
    return {
      width: 750, // 固定宽度
      height: template.height // 根据设计规范调整高度
    }
  }

  // 根据设计规范V5计算商品布局 - 针对每个模板进行精细化调整
  const calculateProductLayout = () => {
    const { width, height } = calculatePosterDimensions()
    const template = templates[selectedTemplate]
    
    // 区域划分 - 严格按照设计规范V5
    const headerHeight = 150
    const footerHeight = 280
    const contentPadding = 30
    const contentWidth = width - (contentPadding * 2)
    const contentHeight = height - headerHeight - footerHeight
    
    // 根据模板类型计算网格
    let rows, cols
    switch (template.layout) {
      case '1x1':
        rows = 1; cols = 1; break
      case '1x2':
        rows = 2; cols = 1; break
      case '1x3':
        rows = 3; cols = 1; break
      case '2x2':
        rows = 2; cols = 2; break
      case '2x3':
        rows = 3; cols = 2; break
      case '3x3':
        rows = 3; cols = 3; break
      default:
        rows = 1; cols = 1
    }
    
    // 计算商品卡片尺寸 - 精细化调整，确保充分利用空间
    const productGap = template.layout === '1x1' ? 0 : (template.layout === '1x2' || template.layout === '1x3' ? 15 : 20)
    const cardWidth = (contentWidth - (cols - 1) * productGap) / cols
    const cardHeight = (contentHeight - (rows - 1) * productGap) / rows
    
    // 商品单元内部布局 - 根据设计规范V5精确计算
    const cardPadding = 8 // 商品卡片内边距
    const imageToTextGap = 16 // 图片与文字间距
    const textLineHeight = 4 // 文字行间距
    const priceGap = 8 // 价格区域间距
    
    // 计算商品图片尺寸（正方形）- 更充分利用空间
    const availableImageWidth = cardWidth - (cardPadding * 2)
    const imageSize = Math.min(availableImageWidth, Math.max(120, availableImageWidth * 0.85))
    
    // 计算文字区域高度
    const textAreaHeight = cardHeight - imageSize - imageToTextGap - (cardPadding * 2)
    
    return {
      headerHeight,
      footerHeight,
      contentPadding,
      contentWidth,
      contentHeight,
      rows,
      cols,
      cardWidth,
      cardHeight,
      cardPadding,
      imageSize,
      imageToTextGap,
      textLineHeight,
      priceGap,
      textAreaHeight,
      productGap,
      // 字体大小 - 根据卡片大小自适应
      fontSize: {
        title: Math.max(14, Math.min(18, cardWidth / 18)),
        spec: Math.max(12, Math.min(14, cardWidth / 22)),
        date: Math.max(12, Math.min(14, cardWidth / 22)),
        originalPrice: Math.max(12, Math.min(14, cardWidth / 22)),
        price: Math.max(16, Math.min(20, cardWidth / 16))
      }
    }
  }

  // 绘制海报
  const drawPoster = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const { width, height } = calculatePosterDimensions()
    const layout = calculateProductLayout()
    const style = styleTemplates[selectedStyle]

    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')

    // 绘制背景
    drawBackground(ctx, width, height, style)
    
    // 绘制头部
    drawHeader(ctx, width, layout, style)
    
    // 绘制商品区域 - 使用优化后的布局
    drawProducts(ctx, layout, style)
    
    // 绘制底部
    drawFooter(ctx, width, height, layout, style)
  }

  // 绘制背景
  const drawBackground = (ctx, width, height, style) => {
    // 创建渐变背景
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, style.primaryColor)
    gradient.addColorStop(1, style.secondaryColor)
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
  }

  // 绘制头部
  const drawHeader = (ctx, width, layout, style) => {
    ctx.fillStyle = style.textColor
    ctx.textAlign = 'center'
    
    // 店铺名称
    ctx.font = 'bold 32px Arial'
    ctx.fillText(posterConfig.storeName, width / 2, 60)
    
    // 店铺标语
    ctx.font = '18px Arial'
    ctx.fillText(posterConfig.storeSlogan, width / 2, 100)
  }

  // 绘制商品展示区域 - 重构版本，精细化调整每个模板的布局，支持日期按需显示
  const drawProducts = (ctx, layout, style) => {
    const startY = layout.headerHeight
    const displayProducts = products.slice(0, templates[selectedTemplate].maxProducts)
    
    displayProducts.forEach((product, index) => {
      const row = Math.floor(index / layout.cols)
      const col = index % layout.cols
      
      const cardX = layout.contentPadding + col * (layout.cardWidth + layout.productGap)
      const cardY = startY + row * (layout.cardHeight + layout.productGap)
      
      // 绘制商品卡片背景
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
      ctx.fillRect(cardX, cardY, layout.cardWidth, layout.cardHeight)
      
      // 商品单元内部布局 - 严格按照设计规范V5
      const innerX = cardX + layout.cardPadding
      const innerY = cardY + layout.cardPadding
      const innerWidth = layout.cardWidth - (layout.cardPadding * 2)
      
      // 绘制商品图片区域（正方形，居中）
      const imageX = innerX + (innerWidth - layout.imageSize) / 2
      const imageY = innerY
      
      // 图片背景
      ctx.fillStyle = '#F3F4F6'
      ctx.fillRect(imageX, imageY, layout.imageSize, layout.imageSize)
      
      // 如果有商品图片，绘制图片
      if (product.image) {
        ctx.save()
        ctx.beginPath()
        ctx.rect(imageX, imageY, layout.imageSize, layout.imageSize)
        ctx.clip()
        ctx.drawImage(product.image, imageX, imageY, layout.imageSize, layout.imageSize)
        ctx.restore()
      } else {
        // 绘制占位符
        ctx.fillStyle = '#9CA3AF'
        ctx.font = '14px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('商品图片', imageX + layout.imageSize / 2, imageY + layout.imageSize / 2 - 10)
        ctx.font = '12px Arial'
        ctx.fillText('未选择任何文件', imageX + layout.imageSize / 2, imageY + layout.imageSize / 2 + 10)
      }
      
      // 绘制商品信息 - 精确控制间距，支持日期按需显示
      let textStartY = imageY + layout.imageSize + layout.imageToTextGap
      const textCenterX = cardX + layout.cardWidth / 2
      
      ctx.textAlign = 'center'
      
      // 商品标题
      ctx.font = `bold ${layout.fontSize.title}px Arial`
      ctx.fillStyle = '#1F2937'
      ctx.fillText(product.title, textCenterX, textStartY)
      textStartY += 20
      
      // 商品规格
      ctx.font = `${layout.fontSize.spec}px Arial`
      ctx.fillStyle = '#6B7280'
      ctx.fillText(product.spec, textCenterX, textStartY)
      textStartY += 18
      
      // 生产日期 - 按需显示
      if (product.productionDate && product.productionDate.trim() !== '') {
        ctx.font = `${layout.fontSize.date}px Arial`
        ctx.fillStyle = '#6B7280'
        ctx.fillText(`生产日期: ${product.productionDate}`, textCenterX, textStartY)
        textStartY += 18
      }
      
      // 价格信息 - 动态调整位置
      const priceStartY = textStartY + 8
      
      // 划线价
      if (product.originalPrice && product.originalPrice !== product.price) {
        ctx.font = `${layout.fontSize.originalPrice}px Arial`
        ctx.fillStyle = '#9CA3AF'
        const originalPriceText = `¥${product.originalPrice}`
        const textMetrics = ctx.measureText(originalPriceText)
        
        ctx.fillText(originalPriceText, textCenterX, priceStartY)
        
        // 绘制删除线
        ctx.strokeStyle = '#9CA3AF'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(textCenterX - textMetrics.width / 2, priceStartY - 3)
        ctx.lineTo(textCenterX + textMetrics.width / 2, priceStartY - 3)
        ctx.stroke()
      }
      
      // 促销价
      ctx.font = `bold ${layout.fontSize.price}px Arial`
      ctx.fillStyle = '#DC2626'
      const finalPriceY = product.originalPrice && product.originalPrice !== product.price ? priceStartY + 20 : priceStartY
      ctx.fillText(`¥${product.price}`, textCenterX, finalPriceY)
    })
  }

  // 绘制底部
  const drawFooter = (ctx, width, height, layout, style) => {
    const footerStartY = height - layout.footerHeight
    
    // 绘制二维码区域背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    const qrAreaHeight = 200
    const qrAreaY = footerStartY + (layout.footerHeight - qrAreaHeight) / 2
    ctx.fillRect(30, qrAreaY, width - 60, qrAreaHeight)
    
    // 绘制二维码
    const qrSize = 120
    const qrX = width / 2 - qrSize / 2
    const qrY = qrAreaY + 20
    
    if (posterConfig.qrCode) {
      ctx.drawImage(posterConfig.qrCode, qrX, qrY, qrSize, qrSize)
    } else {
      // 绘制二维码占位符
      ctx.fillStyle = '#E5E7EB'
      ctx.fillRect(qrX, qrY, qrSize, qrSize)
      ctx.fillStyle = '#9CA3AF'
      ctx.font = '14px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('二维码', qrX + qrSize / 2, qrY + qrSize / 2)
    }
    
    // 绘制底部文字
    ctx.fillStyle = '#374151'
    ctx.font = '16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(posterConfig.bottomText, width / 2, qrY + qrSize + 35)
  }

  // 异步加载图片
  const loadImageAsync = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  }

  // 更新商品信息
  const updateProduct = (index, field, value) => {
    const newProducts = [...products]
    if (field === 'image' && value) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          newProducts[index][field] = img
          setProducts(newProducts)
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(value)
    } else {
      newProducts[index][field] = value
      setProducts(newProducts)
    }
  }

  // 处理CSV导入 - 支持图片链接
  const handleImport = async (csvText) => {
    try {
      const lines = csvText.trim().split('\n')
      if (lines.length < 2) {
        throw new Error('CSV格式错误：至少需要标题行和一行数据')
      }

      const headers = lines[0].split(',').map(h => h.trim())
      const expectedHeaders = ['商品标题', '商品规格', '生产日期', '划线价', '促销价']
      const optionalHeaders = ['商品图片链接']
      
      // 检查必需的列
      const missingHeaders = expectedHeaders.filter(h => !headers.includes(h))
      if (missingHeaders.length > 0) {
        throw new Error(`CSV格式错误：缺少必需的列：${missingHeaders.join(', ')}`)
      }

      const newProducts = []
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        if (values.length < expectedHeaders.length) continue

        const product = {
          id: i,
          title: values[headers.indexOf('商品标题')] || '',
          spec: values[headers.indexOf('商品规格')] || '',
          productionDate: values[headers.indexOf('生产日期')] || '',
          originalPrice: values[headers.indexOf('划线价')] || '',
          price: values[headers.indexOf('促销价')] || '',
          image: null
        }

        // 处理图片链接
        const imageUrlIndex = headers.indexOf('商品图片链接')
        if (imageUrlIndex !== -1 && values[imageUrlIndex]) {
          try {
            const imageUrl = values[imageUrlIndex]
            const img = await loadImageAsync(imageUrl)
            product.image = img
          } catch (error) {
            console.warn(`无法加载图片: ${values[imageUrlIndex]}`, error)
          }
        }

        newProducts.push(product)
      }

      if (newProducts.length === 0) {
        throw new Error('没有找到有效的商品数据')
      }

      setProducts(newProducts)
      setImportError('')
      setShowImport(false)
      setCsvData('')
      
    } catch (error) {
      setImportError(error.message)
    }
  }

  // 下载海报
  const downloadPoster = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `海报_${posterConfig.storeName}_${new Date().getTime()}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  // 更新海报配置
  const updatePosterConfig = (field, value) => {
    if (field === 'qrCode' && value) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          setPosterConfig(prev => ({ ...prev, [field]: img }))
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(value)
    } else {
      setPosterConfig(prev => ({ ...prev, [field]: value }))
    }
  }

  // 调整商品数量
  useEffect(() => {
    const template = templates[selectedTemplate]
    const currentCount = products.length
    const maxProducts = template.maxProducts

    if (currentCount < maxProducts) {
      // 添加商品
      const newProducts = [...products]
      for (let i = currentCount; i < maxProducts; i++) {
        newProducts.push({
          id: i + 1,
          title: `商品 ${i + 1}`,
          spec: '规格信息',
          productionDate: '2024-07-15',
          originalPrice: '29.90',
          price: '19.90',
          image: null
        })
      }
      setProducts(newProducts)
    }
  }, [selectedTemplate])

  // 更新风格
  useEffect(() => {
    const style = styleTemplates[selectedStyle]
    setPosterConfig(prev => ({
      ...prev,
      primaryColor: style.primaryColor,
      secondaryColor: style.secondaryColor
    }))
  }, [selectedStyle])

  // 重绘海报
  useEffect(() => {
    drawPoster()
  }, [selectedTemplate, selectedStyle, posterConfig, products])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">快消品电商海报生成器</h1>
          <p className="text-lg text-gray-600">专业海报设计，一键生成高质量销售海报</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧配置区域 */}
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
                <Select value={selectedStyle} onValueChange={setSelectedStyle}>
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
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
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
                    onChange={(e) => updatePosterConfig('storeName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="storeSlogan">店铺标语</Label>
                  <Input
                    id="storeSlogan"
                    value={posterConfig.storeSlogan}
                    onChange={(e) => updatePosterConfig('storeSlogan', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="bottomText">底部文字</Label>
                  <Input
                    id="bottomText"
                    value={posterConfig.bottomText}
                    onChange={(e) => updatePosterConfig('bottomText', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="qrCode">二维码图片</Label>
                  <Input
                    id="qrCode"
                    type="file"
                    accept="image/*"
                    onChange={(e) => updatePosterConfig('qrCode', e.target.files[0])}
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
                      onChange={(e) => updatePosterConfig('primaryColor', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="secondaryColor">次色调</Label>
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={posterConfig.secondaryColor}
                      onChange={(e) => updatePosterConfig('secondaryColor', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 商品信息配置 */}
            <Card>
              <CardHeader>
                <CardTitle>商品信息配置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {products.slice(0, templates[selectedTemplate].maxProducts).map((product, index) => (
                  <div key={product.id} className="p-4 border rounded-lg space-y-3">
                    <h4 className="font-medium text-gray-900">商品 {index + 1}</h4>
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
                        <Label>生产日期（可选）</Label>
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
                          onChange={(e) => updateProduct(index, 'image', e.target.files[0])}
                        />
                      </div>
                    </div>
                  </div>
                ))}
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
                        className="w-full h-32 p-3 border rounded-md resize-none"
                        value={csvData}
                        onChange={(e) => setCsvData(e.target.value)}
                        placeholder="商品标题,商品规格,生产日期,划线价,促销价,商品图片链接&#10;优质苹果,500g/袋,2024-07-15,29.90,19.90,https://example.com/image.jpg"
                      />
                    </div>
                    {importError && (
                      <div className="text-red-600 text-sm">{importError}</div>
                    )}
                    <Button 
                      onClick={() => handleImport(csvData)}
                      className="w-full"
                    >
                      导入数据
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右侧预览区域 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  海报预览
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <canvas
                    ref={canvasRef}
                    className="border border-gray-300 rounded-lg shadow-lg max-w-full h-auto"
                    style={{ maxHeight: '600px' }}
                  />
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={downloadPoster}
              className="w-full"
              size="lg"
            >
              <Download className="w-5 h-5 mr-2" />
              生成并下载海报
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

