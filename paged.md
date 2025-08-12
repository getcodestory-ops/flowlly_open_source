Write the vibration monitoring report for Vibratech in the template given below, you have been provided a paged js template. you can write the report in the body part of the report , the style and js is already loaded in the header for formatting the report.

The report is for 
  "companyName": "Vibra-Tech Engineers, Inc.",
  "website": "www.vibratechinc.com",
  "addressLines": ["500A Campus Drive", "Mount Holly, NJ 08060"],
  "phone": "609.261.7100"

First ask the user for report data using attachment directive, once they provide the data, examine it carefully it can be in TXT /CSV or pdf format. The data headers might be complicated and might not start right away.

Once you understand the data , ask for report information using directive for project name, project location, report period start, report period end, issue data on authorizing entity.

After that also confirm who the report is beign prepared for , recipient name, company , recipient address , recipient city, recipient state, recipient postal 

You should create and attach appropriate charts for the report as well. 
Rest of the instruction are already in the template below,

<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Vibration Monitoring Report Template</title>
  <script src="https://unpkg.com/pagedjs/dist/paged.polyfill.js"></script>

</head>

  <style>
            body {
            background-color: #EEE;
        }
        .pagedjs_pages {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
        }
        .pagedjs_page {
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.2);
            margin-bottom: 20px;
        }

    @page {
      size: A4; 
      margin: 25mm 25mm 25mm 25mm;

      @top-left {
        content: "Vibration Monitoring Report";
        font-size: 10pt;
      }
      @top-right {
        content: string(section);
        font-size: 10pt;
      }
      @bottom-center {
        content: counter(page) " / " counter(pages);
        font-size: 10pt;
      }
    }

  
    @page cover {
      @top-left { content: none; }
      @top-right { content: none; }
      @bottom-center { content: none; }
    }

  
    @page toc {
      @top-left { content: none; }
      @top-right { content: "Contents"; }
    }

    :root {
      --text: #111;
      --muted: #555;
      --brand: #225adb;
      --border: #ddd;
    }

    html, body { height: 100%; }

    body {
      font-family: "Times New Roman", Times, serif;
      color: var(--text);
      line-height: 1.35;
      font-size: 11pt;
    }

    h1, h2, h3 {
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji";
      margin: 0 0 6pt 0;
      line-height: 1.2;
    }
    h1 { font-size: 22pt; }
    h2 { font-size: 16pt; margin-top: 16pt; }
    h3 { font-size: 13pt; margin-top: 12pt; }

    p { margin: 0 0 8pt 0; }
    a { color: var(--brand); text-decoration: none; }

    h1, h2 { string-set: section content(text); }

    .page-break { break-before: page; }
    .avoid-break { break-inside: avoid; }

    .cover {
      page: cover;
      display: grid;
      place-items: center;
      height: 100vh;
      text-align: center;
    }
    .cover header { justify-self: end; text-align: right; }
    .cover h1 { font-size: 36pt; margin-bottom: 8pt; }
    .cover p { color: var(--muted); }

    .toc { page: toc; }
    .toc h1 { margin-bottom: 8pt; }
    .toc ol { list-style: none; padding: 0; margin: 0; }
    .toc li { display: grid; grid-template-columns: 1fr auto; gap: 12pt; padding: 6pt 0; border-bottom: 1px dashed var(--border); }
    .toc a { color: inherit; }
    .toc .page::after { content: target-counter(attr(data-target url), page); }

    figure { margin: 10pt 0; }
    figure img { display: block; max-width: 100%; height: auto; border: 1px solid var(--border); }
    figcaption { font-size: 9.5pt; color: var(--muted); margin-top: 4pt; }

    table { width: 100%; border-collapse: collapse; font-size: 10.5pt; margin: 8pt 0; }
    th, td { border: 1px solid var(--border); padding: 6pt 8pt; }
    th { background: #f6f7f9; text-align: left; }

    blockquote { margin: 10pt 0; padding: 6pt 10pt; border-left: 3pt solid var(--brand); color: var(--muted); }
    code, pre { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: 10pt; }
    pre { background: #f6f7f9; padding: 8pt; border: 1px solid var(--border); }

    .logo-container {
      text-align: right;
      font-size: 9pt;
    }
    .website-address {
      color: #ffa500;
      font-size: 10pt;
    }
    .prepared-section {
      margin: 20pt 0;
    }
    .table-title {
      text-align: center;
      font-weight: bold;
      margin: 15pt 0 10pt 0;
    }
    .figure-title {
      text-align: center;
      font-weight: bold;
      margin: 15pt 0 10pt 0;
    }
    .image-placeholder {
      width: 70%;
      height: 150px;
      background-color: #f0f0f0;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 12px;
      color: #666;
      border: 1px dashed #999;
      margin: 0 auto;
    }
    .signature-line {
      width: 200px;
      border-top: 1px solid #333;
      margin: 20pt 0 5pt 0;
    }

    .ai-instruction { display: none !important; }
    template { display: none !important; }

  </style>
</head>
<body>
  <!-- COVER -->
  <div class="cover">
    <header>
      <div >
        <img class="logo-container" src="https://flowllydatastorage.blob.core.windows.net/flowllymedia/1f3b01a1e9dd210dc11287542c7f72b4e09f83a8?se=2026-05-29T23%3A26%3A27Z&sp=r&sv=2025-05-05&sr=b&rscc=max-age%3D3600&rscd=inline&rsct=application/octet-stream&sig=hdaXiul48YbCCP3gCGzX6sJh5jDm3CQHm/JhYsim5Q0%3D" alt="Vibra-Tech Logo" style="width: 150px; height: auto;">
        <div class="website-address">www.vibratechinc.com</div>
        <div class="contact-info">
          500A Campus Drive<br>
          Mount Holly, NJ 08060<br>
          (P) 609.261.7100 (F) 609.261.7080
        </div>
      </div>
    </header>
    <h1>Vibration Monitoring Report</h1>
    <h2 >Insert project name</h2>
    <h3 >Insert project location</h3>
    <p >Insert report period start date through insert report period end date</p>
    <div class="prepared-section">
      <p class="prepared-label">Prepared for:</p>
      <p >Insert recipient name<br>
      Insert recipient company<br>
      Insert recipient address line 1<br>
      Insert recipient address line 2 (optional)<br>
      Insert recipient city, Insert recipient state Insert recipient postal code</p>
    </div>
    <div class="prepared-section">
      <p class="prepared-label">Prepared by:</p>
      <p>Vibra-Tech Engineers, Inc.<br>
      500A Campus Drive<br>
      Mount Holly, NJ 08060<br>
      609.261.7100</p>
    </div>
    <p id="placeholder-issue-date">Insert report issue date</p>
  </div>


  <!-- INTRODUCTION SECTION -->
  <!-- INTRODUCTION -->
  <h1 class="page-break">Introduction</h1>
    <p>Vibration monitoring authorized by <span id="placeholder-authorizing-entity">Insert authorizing entity name</span> was carried out by Vibra-Tech Engineers, Inc. at the above-referenced project. Vibration levels were monitored and recorded from <span>Insert report period start date</span> through <span>Insert report period end date</span>.</p>
  

  <!-- SCOPE SECTION -->
  <!-- SCOPE -->
  <h1 class="page-break">Scope and Conditions of Monitoring</h1>
    <h2>Vibration Monitoring</h2>
    <p><span>Insert number of seismographs</span> remote seismograph system(s) equipped with triaxial geophones were installed to record vibrations from construction activities for this project. Table 1 below provides the location, description, and serial number of the remote seismographs used during this monitoring period. Figure 1 shows an aerial view of the site with the sensor locations marked.</p>
    
    <p class="table-title">Table 1: Location of the Remote Seismographs</p>
    <table id="table-remote-seismographs" class="avoid-break">
      <thead>
        <tr>
          <th>Remote Seismograph Location</th>
          <th>Description</th>
          <th>Serial Number</th>
        </tr>
      </thead>
      <tbody>
        <!-- Agent: populate 0..N rows with {location_label, description, serial_number}. If uncertain, engage 'table1_missing' form and show preview. -->
      </tbody>
    </table>

    <figure class="avoid-break">
      <p class="figure-title">Figure 1: Aerial View Showing Remote Vibration Monitoring Locations</p>
      <div id="figure-site-map" class="image-placeholder">[Placeholder for Aerial View Image]</div>
    </figure>
  

  <!-- INSTRUMENTATION SECTION -->
  <!-- INSTRUMENTATION -->
  <h1 class="page-break">Instrumentation</h1>
    <p>The seismographs used for this project directly measure and record the peak particle velocity in three mutually perpendicular directions (longitudinal, transverse, and vertical). The seismographs are also equipped with a microphone to record sound pressure levels. The seismographs meet or exceed the specifications set forth by the International Society of Explosives Engineers in their "Performance Specifications for Blasting Seismographs." All sensors are calibrated annually to ensure their accuracy.</p>
  

  <!-- VIBRATION MEASUREMENTS SECTION -->
  <!-- VIBRATION MEASUREMENTS -->
  <h1 class="page-break">Vibration and Vibration Measurements</h1>
    <p>The measurement of vibration involves quantifying the movement or oscillation of a particle, point, or body from its equilibrium position. Ground vibrations are typically characterized by their frequency (cycles per second or Hertz), displacement (distance moved from equilibrium), velocity (rate of change of displacement), and acceleration (rate of change of velocity). Peak particle velocity (PPV) is the most common metric used to assess the potential for vibration-related damage to structures and is the standard used in most vibration criteria. PPV is the maximum speed at which any particle in the ground is moving as a vibration wave passes.</p>
    <p><strong><u>Please note that Vibra-Tech's Professional Engineer has reviewed the data and the conclusions presented in this report.</u></strong></p>
  

  <!-- RESULTS SECTION -->
  <!-- RESULTS -->
  <h1 class="page-break">Results of the Vibration Monitoring</h1>
    <p>The results of the vibration monitoring are displayed in Table 2, which summarizes the maximum vibration levels recorded at each monitoring location during the monitoring period. Table 3 provides a summary of any vibration events that equaled or exceeded the exceedance threshold. Graphical records from the seismographs, showing the vibration waveforms and peak levels for significant events, are typically included in an appendix to this report.</p>

    <p class="table-title">Table 2: Maximum Vibration Levels Recorded During the Monitoring Period</p>
    <table id="table-max-vibration" class="avoid-break">
      <thead>
        <tr>
          <th>Recording Location/Description</th>
          <th>Monitoring Period</th>
          <th>Maximum Particle Velocity Recorded (in/sec)</th>
        </tr>
      </thead>
      <tbody>
        <!-- Agent: compute max PPV per location within the selected period and populate rows. Date format: MM-DD-YYYY to MM-DD-YYYY. -->
      </tbody>
    </table>

    <p class="table-title">Table 3: Summary of Vibration Events Exceeding Threshold</p>
    <table id="table-exceedances" class="avoid-break">
      <thead>
        <tr>
          <th>Recording Location</th>
          <th>Date</th>
          <th>Time</th>
          <th>Maximum Particle Velocity Recorded (in/sec)</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        <!-- Agent: list events where PPV >= threshold (default 0.5 in/sec unless overridden). Include concise operational notes when available. -->
      </tbody>
    </table>

    <div id="charts-per-location" class="avoid-break">
      <p class="figure-title">Vibration Plots by Location</p>
      <!-- Agent: For each location_label, create a .chart with data-location attr and embed a time-series image/SVG -->
      <div class="chart" data-location="VM#1">
        <div class="image-placeholder">[Time-series plot placeholder]</div>
      </div>
      <!-- More charts inserted dynamically per data -->
    </div>
  

  <!-- CONCLUSION SECTION -->
  <!-- CONCLUSION -->
  <h1 class="page-break">Conclusion</h1>
    <p id="placeholder-conclusions">Insert conclusions summary</p>
    
    <p>Sincerely,</p>
    <p>Vibra-Tech Engineers, Inc.</p>
    
    <div class="signature-line"></div>
    <p>Insert signatory 1 name<br>Insert signatory 1 title</p>
    
    <div class="signature-line"></div>
    <p>Insert signatory 2 name<br>Insert signatory 2 title</p>
  

  <!-- APPENDIX SECTION -->
  <!-- APPENDIX -->
  <h1 class="page-break">Appendix</h1>
    <p>Individual seismograph records, detailed time-series plots, and additional documentation are included here.</p>
    <div class="image-placeholder">[Placeholder for additional plots and records]</div>
  

  <!-- Templates to guide the agent for consistent row structure -->
  <template id="tpl-table1-row" class="ai-instruction">
    <tr>
      <td>Insert monitoring location label</td>
      <td>Insert monitoring location description</td>
      <td>Insert seismograph serial number</td>
    </tr>
  </template>
  <template id="tpl-table2-row" class="ai-instruction">
    <tr>
      <td>Insert monitoring location/description</td>
      <td>Insert period start date to insert period end date</td>
      <td>Insert maximum PPV (in/sec)</td>
    </tr>
  </template>
  <template id="tpl-table3-row" class="ai-instruction">
    <tr>
      <td>Insert recording location</td>
      <td>Insert date (MM-DD-YYYY)</td>
      <td>Insert time (HH:MM:SS)</td>
      <td>Insert PPV (in/sec)</td>
      <td>Insert notes</td>
    </tr>
  </template>
</body>


</html>
