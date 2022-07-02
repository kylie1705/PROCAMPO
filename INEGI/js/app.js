const year = d3.select("#year")
const indicadorOp = d3.select("#indicador")

const graficaHorizontal = async(yyyy, indicador) => {
  
  // Seleccionar area para grafico
  const graph = d3.select("#detailBeneficiarios")

  // Cargar datos a tabular
  const dataset = await d3.csv("agricultura_1994_2019.csv", d3.autoType)

  // Definir dimensiones de grafico y SVG
  const anchoSVG = +graph.style("width").slice(0 , -2)
  const altoSVG  =  ( anchoSVG  * 10 ) / 10

  const margins = {
      top:   50,
      right: 25,
      bottom:75,
      left:  70,
  }
  

  const anchoGraph = anchoSVG - margins.left - margins.right
  const altoGraph  = altoSVG - margins.top -  margins.bottom

  // Crear SVG
  const svg = graph.append("svg")
                   .attr('width', anchoSVG)
                   .attr('height', altoSVG)
  
  let margin = 200,
      width = svg.attr("width") - margin,
      height = svg.attr("height") - margin;

  // Crear gpo o layer ppal
  const gpoGraf = svg.append("g")
                     .attr("transform", `translate(${margins.left},${margins.top})`)
  
  gpoGraf.append("rect")
         .attr("height", altoGraph)
         .attr("width", anchoGraph)
         .attr("fill", "#f8f9fa")
         
  const g = gpoGraf.append("g")
                   .attr("transform",`translate(${margins.left},${margins.top})`)
               
  // Accesores
  const yAccesor = d => d.desc_entidad

  // Escaladores, parte estatica
  const xScale = d3.scaleLinear()
                   .range([0, width]);

  const yScale = d3.scaleBand()
                   .range([0, height])
                   .padding(0.1);

  // X Axis
  // const xAxisTickFormat = number => d3.format('$,.3s')(number).replace('G', 'B');
  const xAxisTickFormat = number => d3.format('$,.3s')(number).replace('G', 'B');

  //  .tickSize(-innerHeight);
  const xTicks = g.append("g")
                  .attr("transform", `translate(0, ${height})`)
                  
  ///////// Axis
  const titulo = g.append("text")
                  .attr("x", width)
                  .attr("y", -5)
                  .classed("titulo", true)

  const etiquetas = g.append("g")
 

  const xAxisGroup = g.append("g")
                      .attr("transform", `translate(0, ${altoGraph})`)
                      .classed("axis", true)
                      
  const yAxisGroup = g
                      .append("g")
                      .classed("axis", true)

                      
  // Funcion dinamica
  const render = (year, id_indicador) => {
      // Filtremos el dataset usando el ID indicador
      const dataFilter = dataset.filter( ( d ) => {
            // console.log(`${d.id_indicador} == ${id_indicador}`)
            return d.id_indicador == id_indicador;
        })
      
      // sort filteres results using year
      dataFilter.sort((a,b) => b[year] - a[year])

      // Take only top 10
      const data = dataFilter.slice(0, 10)

      // Definir rango de colores para barras
      // 
      const color  = d3.scaleThreshold()
                       .domain(Object.keys(data[0]).slice(1))
                       .range(["#f0f3bd", "#00a896", "#028090", "#05668d"])
                       


      // Titulos
      const titleText = ( id_indicador == 1009000050 ) ? 'Top 10 Estados - Beneficiados PROCAMPO'
                      : "Top 10 Estados - Montos Pagados PROCAMPO";

      const xAxisLabelText = ( id_indicador == 1009000050 ) ? 'Total de Beneficiados PROCAMPO'
                          : 'Total de Montos PROCAMPO';


      // Accesores
      const xValue = d => d[year]
      const yValue = d => d.desc_entidad

      // Escaladores, parte dinamica
      xScale.domain([0, d3.max(data, xValue)])
      yScale.domain(data.map(yValue))

      // Update ticks
      xTicks.call(d3.axisBottom(xScale).tickFormat(xAxisTickFormat).tickSize(-height))

      // Grupo de Barras
      const barras = g.append("g")
      
      const rectGpo = barras.selectAll('rect')
                       .data(data, xValue)
                       
      
      rectGpo.enter()
             .append('rect')
             .merge(rectGpo)
             .attr('y', d => yScale(yValue(d)))
             .attr('height', yScale.bandwidth())
             .attr("fill", d => color(xValue(d)))//"lightblue")
             .transition()
             .ease(d3.easeLinear)
             .duration(500)
             .delay(function(d,i){ return i * 50})
             .attr('width', d => xScale(xValue(d)))
         

      yAxisGroup.transition()
                .call(d3.axisLeft(yScale))
   

    // Titulos
    titulo.text(`${year} - ${titleText}`)
      
  }

  /********************************************
  *                  EVENTOS                  *
  ********************************************/
  year.on("change", (e) => {
      e.preventDefault()
      indiID = indicadorOp.node().value
  
      render(e.target.value, indiID)
  })

  indicadorOp.on("change", (e) => {
      e.preventDefault()
      let yyyy = year.node().value
  
      render(yyyy, e.target.value)
  })

  render(yyyy, indicador)
}


/******************** BARRA *******************************/
const draw = async ( year ) => {
    const graf = d3.select("#detailMontos")

    // Dimensiones
    const anchoTotal = +graf.style("width").slice(0 , -2)
    const altoTotal   =   anchoTotal 

    const margins = {
        top: 60,
        right: 20,
        bottom: 75,
        left: 100,
    }
    const ancho = anchoTotal - margins.left - margins.right
    const alto = altoTotal - margins.top -  margins.bottom

    // Elementos graficos
    const svg = graf.append("svg")
                    .attr('width', anchoTotal)
                    .attr('height', altoTotal)


    // g se usa para "agrupar" como tipo
    // capa o layer en photoshop
    const gpoGraf = svg.append("g")
                     .attr("transform", `translate(${margins.left},${margins.top})`)

    gpoGraf.append("rect")
           .attr("height", alto)
           .attr("width", ancho)
           .attr('fill', '#f8f9fa')

    const g = svg.append("g")
                 .attr("transform", `translate(${margins.left},${margins.top})`)


    // Carga de datos
    const dataset = await d3.csv("agricultura_1994_2019.csv", d3.autoType)

    // Accesor x
    const xAccesor = (d) => d.desc_entidad

    // Escalador
    const y = d3.scaleLinear()
                .range([alto, 0])

    // console.log(d3.map(data, xAccesor))
    const x = d3
                .scaleBand()
                .range([0, ancho])
                .paddingOuter(0.2)
                .paddingInner(0.1)

    const titulo = g
                    .append("text")
                    .attr("x", ancho / 2)
                    .attr("y", -15)
                    .classed("titulo", true)

    const etiquetas = g.append("g")

    const xAxisGroup = g
                        .append("g")
                        .attr("transform", `translate(0, ${alto})`)
                        .classed("axis", true)
                        
    const yAxisGroup = g
                        .append("g")
                        .classed("axis", true)


    /************ 
        FUNCION DINAMICA 
    ***********/
    const render = (yyyy) => {

      const dataFilter = dataset.filter( ( d ) => {
       // console.log(d.id_indicador + "==" + indicadorID)
        return d.id_indicador == 1009000050 ;
      })

      dataFilter.sort((a,b) => b[yyyy] - a[yyyy])
      const data = dataFilter.slice(0, 10)
      // console.log(dataFilter)


      // Accesores
      const yAccesor = (d) => d[yyyy]
      data.sort( (a, b) => yAccesor(b) - yAccesor(a) )

      // Escaladores
      y.domain([0, d3.max(data, yAccesor)])
      x.domain(d3.map(data, xAccesor))

       // Rectangulos (Elementos)
      /****************************
       * "y" empieza en cero que es el superior
       * de nuestra area, para pintarlas desde
       * abajo, necesitamos desplazar donde comienza
       * la barra y para ello debemos decirle en donde
       * comienza "y"
       * El alto es el negativo , ya que esta debajo de 0
       *************************/
      const rect = g
                  .selectAll('rect')
                  .data(data, xAccesor)

      rect
          .enter()
          .append("rect")
          .merge(rect)
          .attr("x", (d) => x(xAccesor(d)))
          .attr("y", (d) => y(yAccesor(d)) ) // Comienza en el cero
          .attr("width", x.bandwidth() )
          .attr("fill", "lightblue")
          .transition()
          .duration(1000)
          .delay(function(d,i){ return i * 50})
          .ease(d3.easeLinear)
          .attr("height", (d) => alto - y(yAccesor(d)) )

        // Titulos
      titulo.text(`${yyyy} - Top 10 Estados (Montos entregados)`)
     

      // Ejes
      const xAxis = d3.axisBottom(x)
      const yAxis = d3.axisLeft(y).ticks(8)

      xAxisGroup
              .transition(1000)
              .call(xAxis)

      yAxisGroup
              .transition(1000)
              .call(yAxis)

  }

  render(year)

}

/********************MAPA *********************************/
const drawMap = async (yyyy) => {
    const graf = d3.select("#mexicoMapa")

    // Carga de datos
    // Carga los datos que vamos a tabular
    const dataset = await d3.csv("agricultura_1994_2019.csv", d3.autoType)

    // Crear select con años disponibles
    year.selectAll("option")
           .data(Object.keys(dataset[0]).slice(0, 24))
           .enter()
           .append("option")
           .attr('value', (d) => d)
           .text((d) => d)


    // Carga los datos necesarios para dibujar el mapa
    const mapDataset = await d3.json("geo-data.json")
    
    const indicadores = dataset.filter( (indicador) => {
      return indicador.id_indicador == 1009000050;
    })
    indicadores.sort((a,b) => a[yyyy] - b[yyyy])
     console.log(indicadores)
 
    // Dimensiones
    const ancho = +graf.style("width").slice(0, -2)
    const alto  = ancho + 10

    // Area para dibujo
    const svg = graf
                  .append("svg")
                  .attr("class", "graf")
                  .attr("width", ancho)
                  .attr("height", alto)

      /******************************************************
      * Dibujara nuestro mapa de acuerdo a lo seleccionado  *
      ******************************************************/
      /************************************************************
      * Los puntos para los estados estan definidos en mapDataSet *
      * que cargamos del json geo-data.json que obtuvimos de:     *
      * https://github.com/leenoah1/mexicod3project               *
      * Ajustamos algunos nombres como:                           *
      *   ****** Distrito Federal  por Ciudad de Mexico           *
      ************************************************************/
      const estados = topojson.feature(mapDataset, mapDataset.objects.MEX_adm1)

      // Definamos nuestra proyeccion
      const projection = d3.geoMercator()
      projection.scale(1).translate([0, 0])

      // Definamos path
      const path = d3.geoPath().projection(projection)
      let b = path.bounds(estados)
      let s = .9 / Math.max((b[1][0] - b[0][0]) / ancho, (b[1][1] - b[0][1]) / alto)
      let t = [(ancho - s * (b[1][0] + b[0][0])) / 2, (alto - s * (b[1][1] + b[0][1])) / 2]
      projection.scale(s).translate(t)
                                
      // Definamos el dominio                      
      let min = d3.min(indicadores, (d) => d[yyyy])
      let max = d3.max(indicadores, (d) => d[yyyy])
      let rango = max / 5;

      const color_domain = [0, min, (min + rango), max]
      const color_legend = d3.scaleThreshold()
                             .range(["#f0f3bd", "#00a896", "#028090", "#05668d"])
                             .domain(color_domain);
      
      // Agreguemos el grupo para el mapa
      const g = svg.append('g')

      // Aqui definimos nuestros path para los estados
      // Esta seccion es quien dibuja nuestro mapa
      // de acuerdo a los datos en "states"    
     // console.log(indicadores)
      g.selectAll("path")
       .data(estados.features)
       .join("path")
       .attr("d", path)
       .attr("stroke", "#3f37c9")
       .transition()
       .delay(200)
       .duration(1500)
       .attr('fill', function(d) {
                  const state = d.properties.NAME_1
                  const indicador = indicadores.filter( function(entry) {
                      return entry.desc_entidad === state;
                  })
                  
                  value = ( indicador !== undefined ) ? indicador[0][yyyy] : 0
                  bColor = value == 0 ? "#f0f3bd" : color_legend(value)
                  return bColor;
              })
}

function closeDiv(divId) {
  if ( divId === "info" ) {
    document.getElementById("info").style.display = "none"
    document.getElementById("detail").style.display = "block"
    drawDetails()
  }
  else {
    document.getElementById("info").style.display = "block"
    document.getElementById("detail").style.display = "none"
  }
}


/********************************MAIN POINT ***************************************** */
drawMap("1994")
graficaHorizontal("1994", 1009000050)
draw("1994")
// draw("#detailBeneficiarios", "nacional", 1009000050, "1994")
// drawHorizontal("#detailBeneficiarios", "1994", 1009000050)
// drawHorizontal("#detailBeneficiarios", "nacional", 1009000050, "1994")
