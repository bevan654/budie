import cloudscraper  # Enhanced version


headers = {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-encoding": "identity",  # ← CHANGED: uncompressed
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "max-age=0",
    "priority": "u=0, i",
    "referer": "https://moneysmart.gov.au/api/UnclaimedMoneyService/Simple?accountName=Don+Davis&__cf_chl_tk=S.uesZPRn1TqbKLsp7FlJJsqnz7r9G.K3crby3hAzQ4-1777281988-1.0.1.1-BfjgBgZeTTjcDGobLI5ugEI2zlMQKAiuQOYtosSyPRc",
    "sec-ch-ua": "\"Microsoft Edge\";v=\"147\", \"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"147\"",
    "sec-ch-ua-arch": "x86",
    "sec-ch-ua-bitness": "64",
    "sec-ch-ua-full-version": "147.0.3912.72",
    "sec-ch-ua-full-version-list": "\"Microsoft Edge\";v=\"147.0.3912.72\", \"Not.A/Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"147.0.7727.102\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-model": "",
    "sec-ch-ua-platform": "Windows",
    "sec-ch-ua-platform-version": "10.0.0",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "same-origin",
    "upgrade-insecure-requests": "1",
    "cookie":"cf_clearance=nCGSJJ5OMtvXwmtRaqBKTZZCcXbNZIuECfH1TT2axNM-1777282354-1.2.1.1-5V.AC4o6spSHPJwq6swBLUVSsBogjdpiBm5FYZOeEb0FxH7z7psjZx6pez38kIBarNIrTcNVLi8.Q8BE6MMWGWAWjmJERpDu9UAUJ8mG3UBdr1uP1EbA0sm83YVgU3Sl8nOrdbqdedo4OvS2TWIutNYs4.mcsXDiKtzcnyGAZY_LoTti4PiDzuN7Fn7Foiido4ysLbRWqOQXARpMopwVzVT5YUDxNVNyrahZdoZQOSLqk7Ety8p_9uTVTlqqKTIrhcoxl9P7VOVb5uNamdrHR53zHGqQmokKbkZDExjtFz.5uA_fIGAnLMKTKRnj7UjpIHX9WBElPzoIZXNkH71uww; __cf_bm=DRcZy_r30SOIsl_TstOhKWFZkPbDERQmq4I_UEVfMGA-1777282354.6687157-1.0.1.1-Zzu_BonjgkDviwYDHWaEkQHvt.TYdO5TBdTK.zZNnCqrdASL0eexrZvKq8_0b6DnmDF1UgljZ8ZTjot7DGIGekG9EMQvywWnNlCUzEggS6sp61HW2_JZlqpHfEXKNESb; _ga_B0K7B9148D=GS2.1.s1777282355$o1$g0$t1777282355$j60$l0$h0; _ga=GA1.1.1225534812.1777282356"
    ,"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0"
}

requests=  cloudscraper.create_scraper()

response = requests.get('https://moneysmart.gov.au/api/UnclaimedMoneyService/Simple?accountName=Don%20Davis',headers=headers)

print(response.text)