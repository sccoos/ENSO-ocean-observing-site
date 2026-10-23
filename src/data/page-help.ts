export const pageHelp = {
  "coastal-conditions/shore-stations": `
    <p>Automated shore stations on piers, wharves and other coastal sites—including Humboldt, Santa Cruz Wharf and Scripps Pier—measure nearshore seawater temperature every few minutes as part of the CeNCOOS and SCCOOS networks.</p>
    <p>Each plot compares recent readings with the station's long-term record: the average, minimum, maximum and 90th percentile. The 90th percentile is the usual threshold for a marine heatwave.</p>
    <p>Data are quality-controlled following national QARTOD standards. Full records are available on the <a href="https://data.caloos.org">CalOOS Data Portal</a>.</p>
  `,
  "coastal-conditions/subsurface-moorings": `
    <p><strong>Choose a depth.</strong> The vertical scale on the left marks each sensor depth on the mooring. Click a depth marker or drag the arrow (shown at 20 m). A dashed line marks that depth across the heat map, and the line chart updates to show its temperature anomaly.</p>
    <p><strong>Read the heat map.</strong> Each vertical stripe is a point in time, and depth increases downward. Red shows water warmer than normal for that time of year, and blue shows cooler water. Darker colors mean larger anomalies (see the color scale, top right).</p>
    <p><strong>Explore the time series.</strong> Hover over the line chart to see the date and anomaly value at that point. To zoom in on a time period, click and drag across the chart, then double-click to return to the full record.</p>
  `,
  "offshore-conditions/gliders": `
    <p><strong>Time series.</strong> Each line's temperature anomaly is the departure from its long-term average for that time of year, averaged over the upper 100 m and the 200 km nearest shore. It is plotted alongside the Oceanic Niño Index (ONI) to compare local warming with El Niño in the tropics.</p>
    <p><strong>Cross-sections and animation.</strong> The CUGN climatology animation shows how warm and cool temperature anomalies change over time along each glider line, by depth and distance from shore. Select a line and press Play to animate the plots. Press again to pause, or move the date slider to explore a particular date. The date label identifies the displayed plot. Moving the slider or changing lines pauses playback; at the end of the sequence, press Play to restart from the beginning.</p>
  `,
  "offshore-conditions/satellite": `
    <p>The map shows the daily sea surface temperature anomaly: how much warmer (red) or cooler (blue) the ocean surface is than its long-term average for that date. Use it to see the extent and position of offshore warm water, and how close it comes to the coast.</p>
  `,
  "offshore-conditions/ship-based-sampling": `
    <p>The cross-section shows temperature anomalies along Line 93.3 by depth and distance offshore, compared with the long-term CalCOFI average. Other lines and past cruises can be selected using the embedded controls.</p>
  `,
  upwelling: `
    <p>CUTI estimates how much water is moving up toward the surface near the coast: positive values mean upwelling and negative values mean downwelling. BEUTI estimates how many nutrients that upwelling supplies.</p>
    <p>The plots compare this year's daily values with the long-term average at selected latitudes, showing when upwelling was stronger or weaker than usual.</p>
  `
} as const;
