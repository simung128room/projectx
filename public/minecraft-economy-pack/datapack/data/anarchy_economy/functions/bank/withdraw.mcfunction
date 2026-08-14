execute if score @s ae_bank >= @s withdraw run scoreboard players operation @s ae_money += @s withdraw
execute if score @s ae_bank >= @s withdraw run scoreboard players operation @s ae_bank -= @s withdraw
tellraw @s {"text":"ถอนเงินสำเร็จ (ถ้ายอดพอ)","color":"green"}
