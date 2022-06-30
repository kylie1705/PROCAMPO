const draw = async (el, escala) => {
    const graf = d3.select(el)
    const col = 10

    // Carga de datos
    // Carga los datos que vamos a tabular
    const dataset = await d3.csv("agricultura_1994_2019.csv", d3.autoType)


    // Carga los datos necesarios para dibujar el mapa
    const mapDataset = await d3.json("geo-data.json")

    /* 
          Productores beneficiados por el PROCAMPO
          id_indicador = 1009000050 

          Monto pagado por el PROCAMPO
          id_indicador = 1009000051 

          Filtremos la información en 2 array
        productores y montoProcampo
    */
    const productores = dataset.filter( function(entry) {
        // console.log(entry.id_indicador)
        return entry.id_indicador == 1009000050;
    })
    // productores.sort((a,b) => a.altura - b.altura)


    const montoProcampo = dataset.filter( function(entry) {
        // console.log(entry.id_indicador)
        return entry.id_indicador == 1009000051;
    })
 
    // Dimensiones
    const ancho = +graf.style("width").slice(0, -2)
    const box = ( ancho - 1 ) / col
    const alto  = box * (100 / col) + 10

    // Area para dibujo
    const svg = graf
                  .append("svg")
                  .attr("class", "graf")
                  .attr("width", ancho)
                  .attr("height", alto)


    // Escalador
    let color
    switch (escala) {
      /******************************************************
      * Dibujara nuestro mapa de acuerdo a lo seleccionado  *
      ******************************************************/
      case "mexicoMapa":
            // Definamos nuestra proyeccion
            const projection = d3.geoMercator()
                                .scale(1000)
                                .center([-102.34034978813841, 24.012062015793])//([-90, 26])
            // Definamos el dominio                      
            let min = d3.min(productores, (d) => d["1994"])
            let max = d3.max(productores, (d) => d["1994"])
            let rango = max / 5;

            const color_domain = [0, min, (min + rango), max]
            const color_legend = d3.scaleThreshold()
                                   .range(["#CCC", "#70e000", "#38b000", "#008000"])
                                   .domain(color_domain);
            
            const path = d3.geoPath(projection)
            const g = svg.append('g')

            /************************************************************
            * Los puntos para los estados estan definidos en mapDataSet *
            * que cargamos del json geo-data.json que obtuvimos de:     *
            * https://github.com/leenoah1/mexicod3project               *
            * Ajustamos algunos nombres como:                           *
            *   ****** Distrito Federal  por Ciudad de Mexico         *
            ************************************************************/
            const states = topojson.feature(mapDataset, mapDataset.objects.MEX_adm1)


            
            const calculateScale = (d) => {
                let bbox_path = path.bounds(d), s=0.95 / Math.max(
                                                                      (-85.60903777459771 - -180) / ancho,
                                                                      (0- 0) / alto
                                                                  )
                console.log(d)
            }
            const escalaCGR = calculateScale(states.features)
            // console.log(escalaCGR)


                        
            
            

            // Aqui definimos nuestros path para los estados
            // Esta seccion es quien dibuja nuestro mapa
            // de acuerdo a los datos en "states"
            g.selectAll("path")
             .data(states.features)
             .join("path")
             .attr("d", path)
             .attr("stroke", "#3f37c9")
             .transition()
             .delay(20)
             .duration(1500)
             .attr('fill', function(d) {
                  const state = d.properties.NAME_1
                  const indicador = productores.filter( function(entry) {
                      return entry.desc_entidad === state;
                  })
                  
                  let value = indicador[0]["1994"]
                  return color_legend(value); 
              })
              

/*            // Add the labels
            svg.append("g")
               .selectAll("labels")
               .data(states.features)
               .enter()
               .append("text")
               .attr("x", function(d){return path.centroid(d)[0]})
               .attr("y", function(d){return path.centroid(d)[1]})
               .text(function(d){ return d.properties.NAME_1})
               .attr("text-anchor", "middle")
               .attr("alignment-baseline", "central")
               .style("font-size", 1)
               .style("fill", "white")
               */

      break;
      case "linear":
            color = d3
                      .scaleLinear()
                      .domain(d3.extent(dataset, (d) => d.altura))
                      .range(["#98c1d9", "#3d5a80"])
        break;
      case "quantize":
          color = d3
                    .scaleQuantize()
                    .domain(d3.extent(dataset, (d) => d.altura))
                    .range(["green", "yellow", "red"])
      break;
      case "treshold":
        color = d3
                  .scaleThreshold()
                  .domain([1.5, 1.8])
                  .range(["green", "yellow", "red"])
    break;

      default:
        break;
    }
    
}



/*
const mapa = async () => {
  const mapaSpace = d3.select("map")
  
 
  // Dimensiones
  const ancho = +mapaSpace.style("width").slice(0, -2)
  const box = ( ancho - 10 ) / col
  const alto  = box * (100 / col) + 10

  // mapa
  const projection = d3
                      .geoMercator()
                      .scale(1800)
                      .center([-102, 26])
          
  const svg = d3
                .select("#map")
                .append("svg")
                .attr("width", ancho)
                .attr("height", alto);

  const path = d3.geoPath()
                 .projection(projection)

  svg.append('path')
     .datum(topojson.feature(mx, mx.objects.MEX_adm1))
     .attr('fill', d=> 'grey')
     .attr("stroke", "white")
     .attr("d", path);

  // Carga de datos
  const geo_data = await d3.json("https://gist.githubusercontent.com/leenoah1/535b386ec5f5abdb2142258af395c388/raw/a045778d28609abc036f95702d6a44045ae7ca99/geo-data.json")
  const states = topojson.feature(geo_data, geo_data.objects.MEX_adm1)

}


const draw = async (el, col=10, escala="linear") => {
  const graf = d3.select(el)
 
  // Dimensiones
  const ancho = +graf.style("width").slice(0, -2)
  const box = ( ancho - 10 ) / col
  const alto  = box * (100 / col) + 10

  // Area para dibujo
  const svg = graf
                .append("svg")
                .attr("class", "graf")
                .attr("width", ancho)
                .attr("height", alto)

  // Carga de datos
  const dataset = await d3.csv("data.csv", d3.autoType)
  dataset.sort((a,b) => a.altura - b.altura)

  // Escalador
  let color
  switch (escala) {
    case "linear":
          color = d3
                    .scaleLinear()
                    .domain(d3.extent(dataset, (d) => d.altura))
                    .range(["#98c1d9", "#3d5a80"])
      break;
    case "quantize":
        color = d3
                  .scaleQuantize()
                  .domain(d3.extent(dataset, (d) => d.altura))
                  .range(["green", "yellow", "red"])
    break;
    case "treshold":
      color = d3
                .scaleThreshold()
                .domain([1.5, 1.8])
                .range(["green", "yellow", "red"])
  break;

    default:
      break;
  }
  
  // Dibuj de cuadros
  svg
      .append("g")
      .attr("transform", "translate(5,5)") // Separamos el dibujo 
      .selectAll("rect")
      .data(dataset)
      .join("rect") // hace enter() y append()
      .attr("x", (d, i) => box * ( i % col))
      .attr("y", (d, i) => box * Math.floor( i / col))
      .attr("width", box - 5)
      .attr("height", box - 5)
      .attr("fill", (d) => color(d.altura))
      .attr("stroke", "#3f37c9")
      .attr("text-anchor", "middle")

  svg
    .append("g")
    .attr("treshold", "translate(5, 5 )")
    .selectAll("text")
    .data(dataset)
    .join("text")
    .attr("x", (d, i) => box * ( i % col) + box/2)
    .attr("y", (d, i) => box * Math.floor( i / col) + box/2)
    .text((d) => d.altura)
    .attr("fill", "white")



}
*/

// mapa()
draw("#mexicoMapa", "mexicoMapa")
