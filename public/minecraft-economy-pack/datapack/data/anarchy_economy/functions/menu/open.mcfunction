title @s title {"text":"☠ ANARCHY ECONOMY","color":"dark_red","bold":true}
title @s subtitle {"text":"คลิกคำสั่งด้านล่างเพื่อใช้งานเมนู","color":"gold"}
tellraw @s [""]
tellraw @s [{"text":"  [💰 Wallet]","color":"gold","bold":true,"clickEvent":{"action":"run_command","value":"/function anarchy_economy:menu/wallet"},"hoverEvent":{"action":"show_text","contents":"ดูเงิน"}}]
tellraw @s [{"text":"  [🏦 Bank]","color":"aqua","bold":true,"clickEvent":{"action":"run_command","value":"/function anarchy_economy:menu/bank"},"hoverEvent":{"action":"show_text","contents":"ฝาก/ถอน"}}]
tellraw @s [{"text":"  [🛒 Black Market]","color":"dark_purple","bold":true,"clickEvent":{"action":"run_command","value":"/function anarchy_economy:menu/shop"},"hoverEvent":{"action":"show_text","contents":"ร้านค้าไร้กฎ"}}]
tellraw @s [{"text":"  [⚔ Bounty]","color":"red","bold":true,"clickEvent":{"action":"run_command","value":"/function anarchy_economy:menu/bounty"},"hoverEvent":{"action":"show_text","contents":"ตั้งค่าหัว"}}]
tellraw @s [{"text":"  [⛏ Jobs]","color":"green","bold":true,"clickEvent":{"action":"run_command","value":"/function anarchy_economy:menu/jobs"},"hoverEvent":{"action":"show_text","contents":"งานหาเงิน"}}]
tellraw @s [{"text":"  [🎲 Casino]","color":"light_purple","bold":true,"clickEvent":{"action":"run_command","value":"/function anarchy_economy:menu/casino"},"hoverEvent":{"action":"show_text","contents":"เสี่ยงโชค"}}]
tellraw @s [{"text":"  [🎯 Daily]","color":"yellow","bold":true,"clickEvent":{"action":"run_command","value":"/function anarchy_economy:daily/claim"},"hoverEvent":{"action":"show_text","contents":"รางวัลรายวัน"}}]
tellraw @s [{"text":"  [❓ Help]","color":"white","bold":true,"clickEvent":{"action":"run_command","value":"/function anarchy_economy:menu/help"},"hoverEvent":{"action":"show_text","contents":"คู่มือ"}}]
