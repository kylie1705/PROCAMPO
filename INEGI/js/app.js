const yearSelect = d3.select("#year")

const loadGraphs = async(el, year, graphID) => { 
  // Seleccionar area para grafico
  const elementID = "#" + el
  const graph = d3.select(elementID)

  // Remove old svg
  d3.selectAll(".svg_"+el).remove(); 

  // Cargar datos a tabular
  const dataset = await d3.csv("agricultura_1994_2019.csv", d3.autoType)

  // Carga los datos necesarios para dibujar el mapa
  const mapDataset = await d3.json("geo-data.json")

  // Crear select con años disponibles
  yearSelect.selectAll("option")
      .data(Object.keys(dataset[0]).slice(0, 24))
      .enter()
      .append("option")
      .attr('value', (d) => d)
      .text((d) => d)


  // Definir dimensiones de grafico y SVG
  const anchoSVG = +graph.style("width").slice(0 , -2)
  const altoSVG  = ( graphID === "horizontal") ? ( anchoSVG  * 10 ) / 10
                 : ( graphID === "vertical") ?  anchoSVG
                 : anchoSVG + 10

  const anchoGraph = ( graphID === "horizontal" ) ? anchoSVG - 70 - 25
                   : ( graphID === "vertical" ) ? anchoSVG - 100 - 20
                   : anchoSVG

  const altoGraph  = ( graphID === "horizontal" ) ? altoSVG - 50 - 75
                   : ( graphID === "vertical" ) ? altoSVG - 60 - 75
                   : altoSVG

  // Crear SVG
  const svg = graph.append("svg")
                   .attr('width', anchoSVG)
                   .attr('height', altoSVG)
                   .classed("svg_"+el, true)

  let margin = 200,
      width = svg.attr("width") - margin,
      height = svg.attr("height") - margin;

  // Crear gpo o layer ppal
  let svgClass = d3.select(".svg_"+el)
  const gpoGraf = svg.append("g")
                     .classed("svg_"+el, true)

  if ( graphID === "horizontal" ) {
      gpoGraf.attr("transform", "translate(70, 50)")
  }
  else if ( graphID === "vertical" ) {
      gpoGraf.attr("transform", "translate(100, 60)")
  }
  
  gpoGraf.append("rect")
         .attr("height", altoGraph)
         .attr("width", anchoGraph)

  if ( graphID !== "mapa") {
      gpoGraf.attr("fill", "#f8f9fa")
  }
  else {
    gpoGraf.attr("fill", "white")
  }
         
         
  const g = gpoGraf.append("g")
                   .classed(`${el}`, true)

  if ( graphID === "horizontal" ) {
      g.attr("transform", "translate(70, 50)")
  }
  else if ( graphID === "vertical" ) {
      gpoGraf.attr("transform", "translate(100, 60)")
  }
              
  // Accesores
  const yAccesor = d => d.desc_entidad

  let graphG = d3.select("."+el)
  const xAxisGroup = graphG.append("g")
                           .attr("transform", `translate(0, ${altoGraph})`)
                           
                          
  const yAxisGroup = graphG.append("g")
                           .classed("axis", true)

  switch (graphID) {
    case "horizontal":
          // Escaladores, parte estatica
          const xScale = d3.scaleLinear()
                          .range([0, width]);

          const yScale = d3.scaleBand()
                          .range([0, height])
                          .padding(0.1);

          // X Axis
          // const xAxisTickFormat = number => d3.format('$,.3s')(number).replace('G', 'B');
          const xAxisTickFormat = number => d3.format(',.3s')(number).replace('G', 'B');

          //  .tickSize(-innerHeight);
          const xTicks = graphG.append("g")
                               .attr("transform", `translate(0, ${height})`)
                               .transition()
                          
          ///////// Axis
          // Titulos
          const titleText = 'Top 10 Estados - Beneficiados PROCAMPO'          
          const tituloHorizontal = graphG.append("text")
                                         .attr("x", width)
                                         .attr("y", -5)
                                         .classed("titulo", true)
                              

//          const etiquetas = graphG.append("g")

          // Funcion dinamica
          const renderHorizontal = (year, id_indicador) => {
              // Filtremos el dataset usando el ID indicador
              const dataFilter = dataset.filter( ( d ) => {
                    // console.log(`${d.id_indicador} == ${id_indicador}`)
                    return d.id_indicador == 1009000050;
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
                              

              // Accesores
              const xValue = d => d[year]
              const yValue = d => d.desc_entidad

              // Escaladores, parte dinamica
              xScale.domain([0, d3.max(data, xValue)])
              yScale.domain(data.map(yValue))

              // Update ticks
              xTicks.call(d3.axisBottom(xScale).tickFormat(xAxisTickFormat).tickSize(-height))

              // Grupo de Barras
              const barras = graphG.append("g")
              
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


          barras.selectAll('text')
            .data(data)
            .enter()
            .append("text")
            .attr("x", (d) => xScale(xValue(d)) - 50 )
            .attr('y', (d) => yScale(yValue(d)) + 45 )
            .classed("dataMin", true)
            .style("fill", "lightblue")
            .transition()
            .ease(d3.easeLinear)
            .duration(500)
            .delay(function(d,i){ return i * 50})
            .text( d => d3.format("$,d")(xValue(d)))
                

              yAxisGroup.transition()
                        .call(d3.axisLeft(yScale))
          

            // Titulos
            tituloHorizontal.text(`${year} - ${titleText}`).style('fill', 'black')
              
          }
          renderHorizontal(year)
    break;
    case "vertical":
      const ancho = anchoSVG - 100 - 20
      const alto = altoSVG - 60 - 75

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

      const titulo = graphG.append("text")
                           .attr("x", ancho / 2)
                           .attr("y", -15)
                           .classed("titulo", true)

      /************ 
          FUNCION DINAMICA 
      ***********/
      const renderVertical = (yyyy) => {

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
        // Grupo de Barras
        const barras = graphG.append("g")
                      
        const rect = barras.selectAll('rect')
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

            ////////////////////////////////////////////////
            barras.selectAll('text')
            .data(data)
            .enter()
            .append("text")
            .attr("x", (d) => x(xAccesor(d)))
            .attr("y", (d) => y(yAccesor(d)) ) // Comienza en el cero
            // .attr("transform", "translate(300,150) rotate(-90)")
            .classed("dataMin", true)
            .style("fill", "navy")
            .text( d => d3.format("$,d")(yAccesor(d)))
          




            /////////////////////////////////////////////////////////////////////

          // Titulos
        titulo.text(`${yyyy} - Top 10 Estados (Montos entregados)`).style('fill', 'black')
      

        // Ejes
        const xAxisTickFormat = number => d3.format('$,.3s')(number);
        const xAxis = d3.axisBottom(x)
        const yAxis = d3.axisLeft(y).tickFormat(xAxisTickFormat).ticks(8)

        xAxisGroup
                .transition(1000)
                .call(xAxis)

        yAxisGroup
                .transition(1000)
                .call(yAxis)

      }

      renderVertical(year)

    break;
    case "mapa":
      const indicadores = dataset.filter( (indicador) => {
          return indicador.id_indicador == 1009000050;
      })
      indicadores.sort((a,b) => a[year] - b[year])
  
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
       let s = .9 / Math.max((b[1][0] - b[0][0]) / anchoSVG, (b[1][1] - b[0][1]) / altoSVG)
       let t = [(anchoSVG - s * (b[1][0] + b[0][0])) / 2, (altoSVG - s * (b[1][1] + b[0][1])) / 2]
       projection.scale(s).translate(t)
                                 
       // Definamos el dominio                      
       let min = d3.min(indicadores, (d) => d[year])
       let max = d3.max(indicadores, (d) => d[year])
       let rango = max / 5;
 
       const color_domain = ( min > 0 ) ? [0, min, (min + rango), max]
                          : [min, (min + rango), max - 100  , (max+rango)]
       const rangoColor = ["#f0f3bd", "#00a896", "#028090", "#05668d"]
       const color_legend = d3.scaleThreshold()
                              .range(rangoColor)
                              .domain(color_domain);

      const rangoDatos = ( min > 0 ) ? [0, min, (min + rango), max]
                       : [min, (min + rango), max, (max+rango)]

      const gpoEscala = graphG.append("g")
      const rectEscala = gpoEscala.selectAll('rect')
                         .data(rangoDatos)
                         .enter()
                         .append("rect")
                         .attr("width", 15)
                         .attr("height", 15)
                         .attr("x", (d, i) => ( i * 134) )
                         .attr("y", altoGraph - 470)
                         .attr("fill", (d, i) => ( rangoColor[i]))
                         .classed("rangoColores", true)

      const escalaText = gpoEscala.selectAll('text')
                                  .data(rangoDatos)
                                  .enter()
                                  .append("text")
                                  .attr("x", (d, i) => ( i * 134) + 20 )
                                  .attr("y", altoGraph - 456)
                                  .style("fill", "black")
                                  .classed("rango", true)
                                  .text( (d, i) => { 
                                          let start = ( rangoDatos[i] > 0 ) ? d3.format(",d")(rangoDatos[i] + 1 )
                                                    : 0;
                                          let end = ( rangoDatos[i+1] === undefined ) ? 0
                                                  : rangoDatos[i+1]
                                          
                                          let formattedEnd = d3.format(",d")(end)

                                          if ( start == 0 ) {
                                            return `Sin Información`
                                          }
                                          else {
                                            return (end > 0)  ? `${start} - ${formattedEnd}` : `${start} >`
                                          }

                                          
                                    })
                        
      const title = gpoEscala.append("text")
                         .attr("x", (anchoSVG / 2) + 75)
                         .attr("y", altoGraph - 490)
                         .style("fill", "black")
                         .classed("titulo", true)
                         .text(`Beneficiarios PROCAMPO - ${year}`)


         
       
       // Agreguemos el grupo para el mapa
       const gpoMap = graphG.append("g")
       const paths  = gpoMap.selectAll('path')
                           .data(estados.features)


       // Aqui definimos nuestros path para los estados
       // Esta seccion es quien dibuja nuestro mapa
       // de acuerdo a los datos en "states"    
      // console.log(indicadores)
       paths.enter()
            .append("path")
            .merge(paths)
            .attr("d", path)
            .attr("stroke", "#3f37c9")
            .attr('fill', function(d) {
                      const state = d.properties.NAME_1
                      const indicador = indicadores.filter( function(entry) {
                          return entry.desc_entidad === state;
                      })
                      
                      value = ( indicador !== undefined ) ? indicador[0][year] : 0
                      bColor = value == 0 ? "#f0f3bd" : color_legend(value)
                      return bColor;
                  })
    break;

    default:
    break;
  }

  /*** Eventos ***/
  yearSelect.on("change", (e) => {
    e.preventDefault()

    // renderHorizontal(e.target.value)
    loadGraphs("mexicoMapa", e.target.value, "mapa")
    loadGraphs("detailBeneficiarios", e.target.value, "horizontal")
    loadGraphs("detailMontos", e.target.value, "vertical")
  })


}



/********************************MAIN POINT ***************************************** */
loadGraphs("mexicoMapa", "1994", "mapa")
loadGraphs("detailBeneficiarios", "1994", "horizontal")
loadGraphs("detailMontos", "1994", "vertical")
