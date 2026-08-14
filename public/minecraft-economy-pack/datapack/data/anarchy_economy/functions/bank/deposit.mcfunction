execute if score @s ae_money >= @s deposit run scoreboard players operation @s ae_bank += @s deposit
execute if score @s ae_money >= @s deposit run scoreboard players operation @s ae_money -= @s deposit
tellraw @s {"text":"ฝากเงินสำเร็จ (ถ้ายอดพอ)","color":"green"}
