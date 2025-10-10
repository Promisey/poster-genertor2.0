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
  const [isDrawing, setIsDrawing] = useState(false) // 新增：绘制状态
  const [imageCache, setImageCache] = useState(new Map()) // 新增：图片缓存
  
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

  // 整体风格模板 - 商品区域使用深色背景
  const styleTemplates = {
    professional: {
      name: '专业商务风 - 沉稳大气，高端品质感',
      primaryColor: '#1E40AF',
      secondaryColor: '#3B82F6',
      backgroundColor: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
      textColor: '#FFFFFF',
      productAreaBackgroundColor: '#1E40AF' // 与顶部保持一致的深蓝色
    },
    fresh: {
      name: '清新活力风 - 年轻时尚，充满活力',
      primaryColor: '#10B981',
      secondaryColor: '#34D399',
      backgroundColor: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
      textColor: '#FFFFFF',
      productAreaBackgroundColor: '#10B981' // 与顶部保持一致的深绿色
    },
    warm: {
      name: '温馨家居风 - 温暖舒适，贴近生活',
      primaryColor: '#F59E0B',
      secondaryColor: '#FBBF24',
      backgroundColor: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
      textColor: '#FFFFFF',
      productAreaBackgroundColor: '#F59E0B' // 与顶部保持一致的深橙色
    },
    elegant: {
      name: '优雅简约风 - 简洁大方，品味高雅',
      primaryColor: '#8B5CF6',
      secondaryColor: '#A78BFA',
      backgroundColor: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
      textColor: '#FFFFFF',
      productAreaBackgroundColor: '#8B5CF6' // 与顶部保持一致的深紫色
    },
    vibrant: {
      name: '活力橙色风 - 热情洋溢，充满能量',
      primaryColor: '#EA580C',
      secondaryColor: '#FB923C',
      backgroundColor: 'linear-gradient(135deg, #EA580C 0%, #FB923C 100%)',
      textColor: '#FFFFFF',
      productAreaBackgroundColor: '#EA580C' // 与顶部保持一致的深橙色
    },
    custom: {
      name: '自定义颜色 - 个性化定制',
      primaryColor: posterConfig.primaryColor,
      secondaryColor: posterConfig.secondaryColor,
      backgroundColor: `linear-gradient(135deg, ${posterConfig.primaryColor} 0%, ${posterConfig.secondaryColor} 100%)`,
      textColor: '#FFFFFF',
      productAreaBackgroundColor: posterConfig.primaryColor // 使用自定义主色
    }
  }

  // 基础布局参数 - 增大顶部和底部高度
  const layoutParams = {
    posterWidth: 375, // 固定宽度375px
    baseHeaderHeight: 120, // 增大基础头部高度（从80增加到120）
    baseFooterHeight: 180, // 再次增大基础底部高度（从120增加到180，为放大的二维码预留空间）
    posterPaddingX: 15, // 左右内边距
    posterPaddingY: 20, // 增大上下内边距（从15增加到20）
    productGapX: 10, // 商品水平间距
    productGapY: 10, // 商品垂直间距
    cardPadding: 8, // 商品卡片外边距
    cardInnerPadding: 10, // 增大商品卡片内边距（从8增加到10）
    imageToInfoAreaGap: 15, // 增大图片与信息区域的间距（从10增加到15）
    textLineSpacing: 5, // 增大文字行间距（从4增加到5）
    priceLineHeight: 20, // 增大价格行高（从18增加到20）
    bottomPadding: 10, // 增大底部内边距（从8增加到10）
    borderRadius: 10, // 增大圆角半径（从8增加到10）
    qrCodeSize: 120 // 新增：二维码尺寸（从60增加到120）
  }

  // 绘制圆角矩形函数
  const drawRoundedRect = (ctx, x, y, width, height, radius) => {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
  }

  // 计算商品布局 - 根据新需求完全重构
  const calculateProductLayout = (templateKey) => {
    console.log(`[calculateProductLayout] 开始计算模板 ${templateKey} 的布局`);
    const template = templates[templateKey]
    const maxProducts = template.maxProducts
    const { posterWidth, baseHeaderHeight, baseFooterHeight, posterPaddingX, posterPaddingY, productGapX, productGapY, cardInnerPadding, imageToInfoAreaGap, textLineSpacing, priceLineHeight, bottomPadding } = layoutParams

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
      infoHeight += 2 * (fontSize.title + textLineSpacing)    // 商品名称（允许两行）
      infoHeight += fontSize.spec + textLineSpacing     // 商品规格
      if (product && product.productionDate && product.productionDate.trim() !== '') {
        infoHeight += fontSize.date + textLineSpacing   // 生产日期（按需）
      }
      infoHeight += priceLineHeight                     // 价格行高 (划线价和促销价同行)
      return infoHeight
    }

    // 计算商品图片尺寸（正方形）
    const imagePadding = 3 // 图片与卡片边缘的距离
    const availableWidthForImage = cardWidth - 2 * imagePadding
    
    // 图片尺寸：确保为正方形，并充分利用可用宽度，扩大显示区域
    const imageSize = Math.max(80, availableWidthForImage) // 增大最小尺寸从60到80，并尽可能大

    // 计算商品卡片高度：图片高度 + 图片与信息区域间距 + 信息区域高度 + 底部内边距
    const maxInfoHeight = calculateInfoHeight({ productionDate: '2024-01-01' }) // 假设有日期，取最大高度
    const cardHeight = 2 * cardInnerPadding + imageSize + imageToInfoAreaGap + maxInfoHeight + bottomPadding

    // 计算商品区域总高度
    const productAreaHeight = rows * cardHeight + (rows - 1) * productGapY

    // 计算头部高度（包含宣传图和标题）- 优化计算逻辑
    let headerHeight = baseHeaderHeight
    if (posterConfig.posterTitle && posterConfig.posterTitle.trim() !== '') {
      headerHeight += 40 // 标题高度
    }
    // 注意：宣传图片作为背景，不额外增加高度，而是覆盖在基础头部区域上

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
    console.log(`[handleImageUpload] 尝试为商品 ${index} 上传图片`);
    console.log(`[handleImageUpload] 当前products数组长度: ${products.length}`);
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        // 确保更新的是正确的商品
        setProducts(prevProducts => {
          const newProducts = [...prevProducts];
          // 检查索引是否有效
          if (index >= 0 && index < newProducts.length) {
            newProducts[index] = { ...newProducts[index], image: e.target.result };
            console.log(`[handleImageUpload] 商品 ${index} 图片上传成功，更新后的products:`, newProducts);
          } else {
            console.error(`[handleImageUpload] 无效的商品索引: ${index}, 当前products长度: ${newProducts.length}`);
          }
          return newProducts;
        });
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

  // 图片缓存加载函数 - 性能优化
  const loadImageWithCache = (src) => {
    return new Promise((resolve, reject) => {
      if (!src) {
        resolve(null)
        return
      }

      // 检查缓存
      if (imageCache.has(src)) {
        resolve(imageCache.get(src))
        return
      }

      // 加载新图片
      const img = new Image()
      img.onload = () => {
        // 添加到缓存
        setImageCache(prev => new Map(prev.set(src, img)))
        resolve(img)
      }
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${src}`))
      }
      img.src = src
    })
  }

  // 模板切换处理
  const handleTemplateChange = (templateKey) => {
    console.log(`[handleTemplateChange] 切换模板到: ${templateKey}`);
    setSelectedTemplate(templateKey)
    const template = templates[templateKey]
    
    // 调整商品数量
    const currentProductCount = products.length
    const maxProducts = template.maxProducts
    console.log(`[handleTemplateChange] 当前商品数量: ${currentProductCount}, 新模板最大商品数: ${maxProducts}`);
    
    // 根据新模板的最大商品数调整products数组
    let updatedProducts = [...products];

    if (currentProductCount < maxProducts) {
      // 如果当前商品数量少于新模板的最大商品数，则添加新的空商品
      for (let i = currentProductCount; i < maxProducts; i++) {
        updatedProducts.push({
          id: i + 1,
          title: `商品${i + 1}`,
          spec: '规格信息',
          productionDate: '2024-07-15',
          originalPrice: '29.90',
          price: '19.90',
          image: null
        });
      }
      console.log(`[handleTemplateChange] 添加商品后，products长度: ${updatedProducts.length}`);
    } else if (currentProductCount > maxProducts) {
      // 如果当前商品数量多于新模板的最大商品数，则截断多余的商品
      updatedProducts = updatedProducts.slice(0, maxProducts);
      console.log(`[handleTemplateChange] 减少商品后，products长度: ${updatedProducts.length}`);
    }

    // 确保所有商品ID和索引匹配
    updatedProducts = updatedProducts.map((product, index) => ({
      ...product,
      id: index + 1, // 重新分配ID以确保连续性
    }));

    setProducts(updatedProducts);
    console.log(`[handleTemplateChange] 模板切换完成，当前模板最大商品数: ${maxProducts}，更新后的products:`, updatedProducts);
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
    console.log("[handleImportCSV] 开始导入CSV数据");
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
            id: i,
            title: values[headers.indexOf('商品标题')] || `商品${i}`,
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

      // 根据当前模板的最大商品数调整导入的产品列表
      const maxProducts = templates[selectedTemplate].maxProducts;
      let finalProducts = newProducts.slice(0, maxProducts);

      // 确保finalProducts的长度与maxProducts一致，不足则填充空商品
      while (finalProducts.length < maxProducts) {
        finalProducts.push({
          id: finalProducts.length + 1,
          title: `商品${finalProducts.length + 1}`,
          spec: '规格信息',
          productionDate: '2024-07-15',
          originalPrice: '29.90',
          price: '19.90',
          image: null
        });
      }

      setProducts(finalProducts);
      console.log(`[handleImportCSV] 导入CSV数据完成，products长度: ${finalProducts.length}`);
      console.log("[handleImportCSV] 导入的产品数据:", finalProducts);

      if (finalProducts.length > 0) {
        setShowImport(false)
        setCsvData('')
      } else {
        throw new Error('未能解析到有效的商品数据')
      }
    } catch (error) {
      setImportError(error.message)
    }
  }

  // 异步绘制海报 - 修复下载按钮失效问题
  const drawPoster = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    setIsDrawing(true)
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

    try {
      // 绘制头部区域
      await drawHeader(ctx, style, layout.headerHeight)

      // 修复顶部图片与商品区域间距的背景色问题
      ctx.fillStyle = style.productAreaBackgroundColor
      ctx.fillRect(0, layout.headerHeight, canvas.width, layoutParams.posterPaddingY)

      // 绘制商品区域背景
      ctx.fillStyle = style.productAreaBackgroundColor
      ctx.fillRect(0, layout.headerHeight + layoutParams.posterPaddingY, canvas.width, layout.productAreaHeight + 2 * layoutParams.posterPaddingY)

      // 绘制商品区域
      await drawProducts(ctx, layout, style)

      // 绘制底部区域
      await drawFooter(ctx, layout.posterHeight)
    } catch (error) {
      console.error('绘制海报时出错:', error)
    } finally {
      setIsDrawing(false)
    }
  }

  // 绘制头部 - 优化宣传图片作为背景的处理
  const drawHeader = async (ctx, style, headerHeight) => {
    const { posterWidth, baseHeaderHeight } = layoutParams
    let currentY = 0

    // 绘制宣传图片作为背景
    if (posterConfig.headerImage) {
      try {
        const img = await loadImageWithCache(posterConfig.headerImage)
        if (img) {
          // 计算图片自适应尺寸，确保覆盖整个头部区域
          const imgAspectRatio = img.width / img.height
          const targetWidth = posterWidth
          const targetHeight = headerHeight // 使用整个头部高度

          let drawX = 0
          let drawY = 0
          let drawWidth = targetWidth
          let drawHeight = targetHeight

          // 如果图片宽高比与目标区域不匹配，进行裁剪
          const targetAspectRatio = targetWidth / targetHeight
          if (imgAspectRatio > targetAspectRatio) {
            // 图片更宽，需要裁剪宽度
            drawWidth = targetHeight * imgAspectRatio
            drawX = (targetWidth - drawWidth) / 2
          } else {
            // 图片更高，需要裁剪高度
            drawHeight = targetWidth / imgAspectRatio
            drawY = (targetHeight - drawHeight) / 2
          }

          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
        }
      } catch (error) {
        console.error('宣传图片加载失败:', error)
      }
    } else {
      // 如果没有宣传图片，绘制渐变背景
      const gradient = ctx.createLinearGradient(0, currentY, posterWidth, currentY + headerHeight)
      gradient.addColorStop(0, style.primaryColor)
      gradient.addColorStop(1, style.secondaryColor)
      
      ctx.fillStyle = gradient
      ctx.fillRect(0, currentY, posterWidth, headerHeight)
    }

    // 绘制店铺名称和标语（叠加在背景上）
    drawStoreInfo(ctx, style, currentY, posterWidth, baseHeaderHeight)

    // 绘制海报标题
    if (posterConfig.posterTitle && posterConfig.posterTitle.trim() !== '') {
      drawPosterTitle(ctx, currentY + baseHeaderHeight, posterWidth)
    }
  }

  // 绘制店铺名称和标语的辅助函数 - 优化位置计算
  const drawStoreInfo = (ctx, style, startY, posterWidth, baseHeaderHeight) => {
    ctx.fillStyle = style.textColor
    ctx.font = 'bold 26px Arial, sans-serif' // 增大字体
    ctx.textAlign = 'center'
    ctx.fillText(posterConfig.storeName, posterWidth / 2, startY + baseHeaderHeight * 0.4)

    ctx.font = '16px Arial, sans-serif' // 增大字体
    ctx.fillText(posterConfig.storeSlogan, posterWidth / 2, startY + baseHeaderHeight * 0.7)
  }

  // 绘制海报标题的辅助函数 - 优化位置计算
  const drawPosterTitle = (ctx, startY, posterWidth) => {
    ctx.fillStyle = '#1F2937'
    ctx.font = 'bold 20px Arial, sans-serif' // 增大字体
    ctx.textAlign = 'center'
    ctx.fillText(posterConfig.posterTitle, posterWidth / 2, startY + 25)
  }

  // 绘制商品区域 - 优化圆角和布局
  const drawProducts = async (ctx, layout, style) => {
    console.log('[drawProducts] 开始绘制商品');
    console.log('[drawProducts] 当前商品数据:', products);
    const { posterWidth, posterPaddingX, posterPaddingY, productGapX, productGapY, cardInnerPadding, imageToInfoAreaGap, textLineSpacing, priceLineHeight, bottomPadding, borderRadius } = layoutParams
    const { headerHeight, cardWidth, cardHeight, imageSize, fontSize, cols, rows, calculateInfoHeight } = layout

    // 图片边缘距离设置
    const imagePadding = 3 // 图片与卡片边缘的距离

    // 计算商品展示区域的起始位置
    const productAreaStartY = headerHeight + posterPaddingY
    const productAreaStartX = posterPaddingX

    const productPromises = products.slice(0, templates[selectedTemplate].maxProducts).map(async (product, index) => {
      // 计算商品卡片位置
      const row = Math.floor(index / cols)
      const col = index % cols
      
      const cardX = productAreaStartX + col * (cardWidth + productGapX)
      const cardY = productAreaStartY + row * (cardHeight + productGapY)

      // 绘制商品卡片背景 (圆角)
      ctx.fillStyle = '#FFFFFF'
      drawRoundedRect(ctx, cardX, cardY, cardWidth, cardHeight, borderRadius)
      ctx.fill()
      
      // 绘制商品卡片边框 (圆角)
      ctx.strokeStyle = '#E5E7EB'
      ctx.lineWidth = 1
      drawRoundedRect(ctx, cardX, cardY, cardWidth, cardHeight, borderRadius)
      ctx.stroke()

      // 计算内容区域
      const contentX = cardX + cardInnerPadding
      const contentY = cardY + cardInnerPadding
      const contentWidth = cardWidth - 2 * cardInnerPadding
      const contentHeight = cardHeight - 2 * cardInnerPadding

      // 绘制商品图片（正方形，居中显示，圆角）
      const imageX = cardX + imagePadding
      const imageY = cardY + imagePadding

      // 裁剪图片为圆角
      ctx.save()
      drawRoundedRect(ctx, imageX, imageY, imageSize, imageSize, borderRadius)
      ctx.clip()

      if (product.image) {
        try {
          const img = await loadImageWithCache(product.image)
          if (img) {
            ctx.drawImage(img, imageX, imageY, imageSize, imageSize)
          } else {
            drawImagePlaceholder(ctx, imageX, imageY, imageSize, borderRadius)
          }
        } catch (error) {
          console.error('产品图片加载失败:', error)
          drawImagePlaceholder(ctx, imageX, imageY, imageSize, borderRadius)
        }
      } else {
        drawImagePlaceholder(ctx, imageX, imageY, imageSize, borderRadius)
      }

      ctx.restore() // 恢复画布状态

      // 绘制商品信息
      drawProductInfo(ctx, product, cardX, cardY, cardWidth, cardHeight, imageY + imageSize, fontSize, calculateInfoHeight, style)
    })

    await Promise.all(productPromises)
  }

  // 绘制商品信息的辅助函数 - 优化垂直居中和价格同行
  const drawProductInfo = (ctx, product, cardX, cardY, cardWidth, cardHeight, imageBottomY, fontSize, calculateInfoHeight, style) => {
    const { cardInnerPadding, textLineSpacing, priceLineHeight } = layoutParams
    const contentX = cardX + cardInnerPadding
    const contentWidth = cardWidth - 2 * cardInnerPadding

    // 计算信息区域的可用高度
    const infoAreaAvailableHeight = cardY + cardHeight - cardInnerPadding - imageBottomY - layoutParams.bottomPadding
    const actualInfoHeight = calculateInfoHeight(product)

    // 计算信息区域的起始Y坐标，使其垂直居中
    let textStartY = imageBottomY + layoutParams.imageToInfoAreaGap + (infoAreaAvailableHeight - actualInfoHeight) / 2

    // 商品标题
    ctx.fillStyle = '#1F2937'
    ctx.font = `bold ${fontSize.title}px Arial, sans-serif`
    ctx.textAlign = 'center'
    const titleText = product.title;
    const maxTitleWidth = contentWidth;
    const titleLineHeight = fontSize.title + textLineSpacing;
    let currentTitleY = textStartY;

    // 改进的文本换行函数，支持中英文混合文本的智能换行
    const wrapText = (context, text, x, y, maxWidth, lineHeight, maxLines) => {
      if (!text || text.trim() === '') return 0;
      
      const words = text.split('');
      const lines = [];
      let currentLine = '';
      
      for (let i = 0; i < words.length; i++) {
        const testLine = currentLine + words[i];
        const testWidth = context.measureText(testLine).width;
        
        if (testWidth > maxWidth && currentLine !== '') {
          lines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      
      if (currentLine !== '') {
        lines.push(currentLine);
      }
      
      // 绘制文本行
      for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
        let textToDraw = lines[i];
        if (i === maxLines - 1 && lines.length > maxLines) {
          // 如果是最后一行且还有更多内容，则添加省略号
          let ellipsis = '...';
          let ellipsisWidth = context.measureText(ellipsis).width;
          let availableWidth = maxWidth - ellipsisWidth;
          while (context.measureText(textToDraw).width > availableWidth && textToDraw.length > 0) {
            textToDraw = textToDraw.slice(0, -1);
          }
          textToDraw += ellipsis;
        }
        context.fillText(textToDraw, x, y + i * lineHeight);
      }
      return Math.min(lines.length, maxLines) * lineHeight;
    };

    const maxTitleLines = 2; // 标题允许两行以更好处理长文本
    const drawnTitleHeight = wrapText(ctx, titleText, contentX + contentWidth / 2, currentTitleY, maxTitleWidth, titleLineHeight, maxTitleLines);
    textStartY = currentTitleY + drawnTitleHeight;

    // 商品规格
    ctx.fillStyle = '#6B7280'
    ctx.font = `${fontSize.spec}px Arial, sans-serif`
    ctx.textAlign = 'center'
    const specText = product.spec;
    const maxSpecWidth = contentWidth;
    const specLineHeight = fontSize.spec + textLineSpacing;
    const maxSpecLines = 1; // 规格只允许一行
    const drawnSpecHeight = wrapText(ctx, specText, contentX + contentWidth / 2, textStartY, maxSpecWidth, specLineHeight, maxSpecLines);
    textStartY += drawnSpecHeight;

    // 生产日期
    if (product.productionDate && product.productionDate.trim() !== '') {
      ctx.fillStyle = '#9CA3AF';
      ctx.font = `${fontSize.date}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      const dateText = `生产日期: ${product.productionDate}`;
      const maxDateWidth = contentWidth;
      const dateLineHeight = fontSize.date + textLineSpacing;
      const maxDateLines = 1; // 生产日期只允许一行
      const drawnDateHeight = wrapText(ctx, dateText, contentX + contentWidth / 2, textStartY, maxDateWidth, dateLineHeight, maxDateLines);
      textStartY += drawnDateHeight;
    }

    // 价格信息 (划线价和促销价同行)
    ctx.textAlign = 'left'; // 价格左对齐
    const priceAreaStartX = contentX;

    // 划线价
    if (product.originalPrice && parseFloat(product.originalPrice) > 0) {
      ctx.fillStyle = '#9CA3AF';
      ctx.font = `${fontSize.originalPrice}px Arial, sans-serif`;
      const originalPriceText = `¥${product.originalPrice}`;
      const originalPriceWidth = ctx.measureText(originalPriceText).width;
      ctx.fillText(originalPriceText, priceAreaStartX, textStartY + priceLineHeight / 2);

      // 绘制划线
      ctx.beginPath();
      ctx.strokeStyle = '#9CA3AF';
      ctx.lineWidth = 1;
      ctx.moveTo(priceAreaStartX, textStartY + priceLineHeight / 2 - fontSize.originalPrice / 4);
      ctx.lineTo(priceAreaStartX + originalPriceWidth, textStartY + priceLineHeight / 2 - fontSize.originalPrice / 4);
      ctx.stroke();

      // 促销价紧随其后
      ctx.fillStyle = style.primaryColor; // 使用主色调
      ctx.font = `bold ${fontSize.price}px Arial, sans-serif`;
      const priceText = `¥${product.price}`;
      ctx.fillText(priceText, priceAreaStartX + originalPriceWidth + 5, textStartY + priceLineHeight / 2);
    } else {
      // 如果没有划线价，促销价直接显示
      ctx.fillStyle = style.primaryColor; // 使用主色调
      ctx.font = `bold ${fontSize.price}px Arial, sans-serif`;
      const priceText = `¥${product.price}`;
      ctx.fillText(priceText, priceAreaStartX, textStartY + priceLineHeight / 2);
    }
  }

  // 绘制图片占位符 (圆角)
  const drawImagePlaceholder = (ctx, x, y, size, borderRadius) => {
    ctx.fillStyle = '#F3F4F6'
    drawRoundedRect(ctx, x, y, size, size, borderRadius)
    ctx.fill()
    
    ctx.strokeStyle = '#D1D5DB'
    ctx.lineWidth = 1
    drawRoundedRect(ctx, x, y, size, size, borderRadius)
    ctx.stroke()
    
    ctx.fillStyle = '#9CA3AF'
    ctx.font = '10px Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('商品图片', x + size / 2, y + size / 2 - 5)
    ctx.fillText('暂未上传', x + size / 2, y + size / 2 + 8)
  }

  // 绘制底部区域 - 优化布局，放大二维码，增加背景色，修复占位符显示，整体居中
  const drawFooter = async (ctx, posterHeight) => {
    console.log("drawFooter: 开始绘制底部区域")
    console.log("drawFooter: 当前选择的风格 =", selectedStyle)

    const { posterWidth, baseFooterHeight, qrCodeSize, posterPaddingY } = layoutParams
    const footerY = posterHeight - baseFooterHeight

    // 直接从styleTemplates获取背景色，确保使用正确的深色
    const currentStyle = styleTemplates[selectedStyle] || styleTemplates.professional
    const footerBackgroundColor = currentStyle.productAreaBackgroundColor
    console.log("drawFooter: 从styleTemplates获取的背景色 =", footerBackgroundColor)
    
    ctx.fillStyle = footerBackgroundColor
    ctx.fillRect(0, footerY, posterWidth, baseFooterHeight)

    // 计算二维码和底部文字作为整体的居中位置
    const textHeight = 20 // 底部文字的大致高度
    const qrToTextGap = 25 // 二维码到文字的间距
    const totalContentHeight = qrCodeSize + qrToTextGap + textHeight // 总内容高度
    const availableHeight = baseFooterHeight - 2 * posterPaddingY // 可用高度（减去上下边距）
    const centerOffset = (availableHeight - totalContentHeight) / 2 // 居中偏移量
    
    // 计算二维码的实际位置（整体居中）
    const qrX = posterWidth / 2 - qrCodeSize / 2
    const qrY = footerY + posterPaddingY + centerOffset
    
    console.log("drawFooter: 居中计算 - totalContentHeight =", totalContentHeight, "availableHeight =", availableHeight, "centerOffset =", centerOffset)
    console.log("drawFooter: 二维码位置 qrX =", qrX, "qrY =", qrY)

    // 绘制二维码或占位符
    if (posterConfig.qrCode && posterConfig.qrCode.trim().length > 0) {
      try {
        const img = await loadImageWithCache(posterConfig.qrCode)
        if (img) {
          ctx.drawImage(img, qrX, qrY, qrCodeSize, qrCodeSize)
        } else {
          drawQRPlaceholder(ctx, qrX, qrY, posterWidth)
        }
      } catch (error) {
        console.error('二维码加载失败:', error)
        drawQRPlaceholder(ctx, qrX, qrY, posterWidth)
      }
    } else {
      // 没有二维码时显示占位符
      drawQRPlaceholder(ctx, qrX, qrY, posterWidth)
    }

    // 绘制底部文字（在二维码下方，保持整体居中）
    console.log("drawFooter: 绘制底部文字，当前fillStyle =", ctx.fillStyle)
    ctx.fillStyle = '#FFFFFF' // 白色文字在深色背景上更清晰
    ctx.font = '14px Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    const textY = qrY + qrCodeSize + qrToTextGap
    console.log("drawFooter: 底部文字位置 textY =", textY, "footerY =", footerY, "posterHeight =", posterHeight)
    console.log("drawFooter: 文字内容 =", posterConfig.bottomText)
    ctx.fillText(posterConfig.bottomText, posterWidth / 2, textY)
  }

  // 绘制二维码占位符 - 修复背景色跟随风格变化，支持居中布局
  const drawQRPlaceholder = (ctx, qrX, qrY, posterWidth) => {
    console.log("drawQRPlaceholder: 绘制二维码占位符")
    const { qrCodeSize } = layoutParams
    
    // 直接从styleTemplates获取背景色，确保与底部区域一致
    const currentStyle = styleTemplates[selectedStyle] || styleTemplates.professional
    const placeholderBackgroundColor = currentStyle.productAreaBackgroundColor
    console.log("drawQRPlaceholder: 从styleTemplates获取的占位符背景色 =", placeholderBackgroundColor)
    
    ctx.fillStyle = placeholderBackgroundColor
    ctx.fillRect(qrX, qrY, qrCodeSize, qrCodeSize)
    
    // 使用白色边框，在深色背景上清晰可见
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 2
    ctx.strokeRect(qrX, qrY, qrCodeSize, qrCodeSize)
    
    // 使用白色文字，在深色背景上清晰可见
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '16px Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    console.log("drawQRPlaceholder: 占位符位置 qrX =", qrX, "qrY =", qrY, "size =", qrCodeSize)
    ctx.fillText('二维码', qrX + qrCodeSize / 2, qrY + qrCodeSize / 2)
  }

  // 下载海报 - 修复失效问题，增加延迟确保Canvas渲染完成
  const downloadPoster = async () => {
    if (isDrawing) {
      alert('海报正在生成中，请稍候...')
      return
    }

    const canvas = canvasRef.current
    if (!canvas) {
      alert('海报未生成，请稍候重试')
      return
    }

    try {
      setIsDrawing(true)
      
      // 确保海报已完全绘制
      await drawPoster()
      
      // 增加延迟，确保Canvas内容完全渲染
      await new Promise(resolve => setTimeout(resolve, 200))

      const link = document.createElement('a')
      link.download = `海报_${new Date().getTime()}.png`
      link.href = canvas.toDataURL('image/png', 1.0)
      link.click()
    } catch (error) {
      console.error('下载海报时出错:', error)
      alert('下载失败，请重试')
    } finally {
      setIsDrawing(false)
    }
  }

  // 监听状态变化，自动重绘海报 - 添加防抖机制
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      drawPoster()
    }, 150) // 增加防抖延迟到150ms以提高性能

    return () => clearTimeout(timeoutId)
  }, [
    selectedTemplate, 
    selectedStyle, 
    products, 
    posterConfig.storeName,
    posterConfig.storeSlogan,
    posterConfig.posterTitle,
    posterConfig.headerImage,
    posterConfig.bottomText,
    posterConfig.qrCode,
    posterConfig.primaryColor,
    posterConfig.secondaryColor
  ])

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

                  {/* 自定义颜色选择器 - 只有选择自定义风格时才显示 */}
                  {selectedStyle === 'custom' && (
                    <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
                      <h4 className="font-medium text-sm">自定义颜色设置</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="primaryColor">主色调</Label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              id="primaryColor"
                              value={posterConfig.primaryColor}
                              onChange={(e) => setPosterConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                              className="w-12 h-8 border rounded cursor-pointer"
                            />
                            <Input
                              value={posterConfig.primaryColor}
                              onChange={(e) => setPosterConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                              placeholder="#3B82F6"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="secondaryColor">辅助色</Label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              id="secondaryColor"
                              value={posterConfig.secondaryColor}
                              onChange={(e) => setPosterConfig(prev => ({ ...prev, secondaryColor: e.target.value }))}
                              className="w-12 h-8 border rounded cursor-pointer"
                            />
                            <Input
                              value={posterConfig.secondaryColor}
                              onChange={(e) => setPosterConfig(prev => ({ ...prev, secondaryColor: e.target.value }))}
                              placeholder="#60A5FA"
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
                    <Label htmlFor="headerImage">顶部宣传图片（可选，建议尺寸1125x405）</Label>
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
                      placeholder="商品标题,商品规格,生产日期,划线价,促销价,商品图片链接\n优质苹果,500g/袋,2024-07-15,29.90,19.90,https://example.com/apple.jpg"
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
                              onClick={() => document.getElementById(`file-input-${index}`).click()}
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
                            id={`file-input-${index}`}
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
                  <Button 
                    onClick={downloadPoster} 
                    className="flex items-center gap-2"
                    disabled={isDrawing}
                  >
                    <Download className="w-4 h-4" />
                    {isDrawing ? '生成中...' : '下载海报'}
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

