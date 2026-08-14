scoreboard players enable @a menu
scoreboard players enable @a pay
scoreboard players enable @a withdraw
scoreboard players enable @a deposit
scoreboard players enable @a bounty
execute as @a[scores={menu=1..}] run function anarchy_economy:menu/open
scoreboard players set @a[scores={menu=1..}] menu 0
execute as @a[scores={deposit=1..}] run function anarchy_economy:bank/deposit
scoreboard players set @a[scores={deposit=1..}] deposit 0
execute as @a[scores={withdraw=1..}] run function anarchy_economy:bank/withdraw
scoreboard players set @a[scores={withdraw=1..}] withdraw 0
