$ErrorActionPreference = "Stop"
$sheetId = "1UKULoyYdh0dklWaA2ixIM6Ff67bPj7SG0G-deQg66UA"
$apiUrl = "https://jps-3d-druck.vercel.app/api/orders"

$resp = Invoke-RestMethod -Uri $apiUrl -Method Get
$orders = @($resp.orders)

$headers = @(
  "Bestell-Nr", "Zeitstempel", "Bezahlt", "Zahlungsart", "Summe (€)",
  "Name", "E-Mail", "Telefon", "Lieferart", "Adresse",
  "Artikel (Kurz)", "Notiz", "RohdatenJSON"
)

$rows = @(,$headers)
foreach ($o in $orders) {
  $c = $o.customer
  $addr = if ($c.delivery -eq "pickup") { "Abholung am Stand" } else {
    (@($c.street, "$($c.zip) $($c.city)".Trim()) | Where-Object { $_ }) -join ", "
  }
  $items = (@($o.items) | ForEach-Object {
    $d = if ($_.details) { ", $($_.details)" } else { "" }
    "$($_.quantity)x $($_.name) ($($_.colorName)$d)"
  }) -join " | "

  $rows += ,@(
    [string]$o.id,
    [string]$o.createdAt,
    $(if ($o.paid) { "JA" } else { "OFFEN" }),
    $(if ($o.paymentMethod -eq "cash") { "Bar am Stand" } else { "PayPal" }),
    ([double]$o.total).ToString("F2"),
    [string]$c.name,
    [string]$c.email,
    [string]$c.phone,
    $(if ($c.delivery -eq "pickup") { "Abholung am Stand" } else { "Versand" }),
    [string]$addr,
    [string]$items,
    [string]$c.notes,
    ($o | ConvertTo-Json -Depth 6 -Compress)
  )
}

$batchFile = Join-Path $env:TEMP "jps_sheets_sync.json"
$batch = @(
  @{
    op = "write"
    range = "Bestellungen!A1"
    data = $rows
  }
)
$json = ConvertTo-Json -InputObject @($batch) -Depth 6
[System.IO.File]::WriteAllText($batchFile, $json, (New-Object System.Text.UTF8Encoding($false)))
gsheets mutate batch $sheetId -f $batchFile
Write-Output "Synced $($orders.Count) orders to Google Sheet $sheetId"
