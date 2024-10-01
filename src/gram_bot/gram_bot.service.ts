import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { GroupService } from 'src/group/group.service';
import { ProjectService } from 'src/project/project.service';
// import { StatusService } from 'src/status/status.service';
import { TaskService } from 'src/task/task.service';
import { UserService } from 'src/user/user.service';
import { TelegramClient, Api } from 'telegram';
import { NewMessage } from 'telegram/events';
import { StringSession } from 'telegram/sessions';
import * as fs from 'fs';
import * as path from 'path';
import { CustomFile } from 'telegram/client/uploads';
import { NotificationService } from 'src/notification/notification.service';
import { PrismaService } from 'src/prisma.service';
// import { EditedMessage } from 'telegram/events/EditedMessage';
import { EventBuilder } from 'telegram/events/common';

interface InitTask {
    topic: { title: string; id: number };
    message_id: number;
    user_id: number;
    name: string;
    project_id: number;
}

@Injectable()
export class GramBotService implements OnModuleInit {
    private readonly apiId: number = parseInt(process.env.TELEGRAM_API_ID, 10);
    private readonly apiHash: string = process.env.TELEGRAM_API_HASH;
    private readonly botToken: string = process.env.TELEGRAM_BOT_TOKEN;
    private readonly client: TelegramClient;
    private readonly logger = new Logger(GramBotService.name);

    constructor(
        private readonly taskService: TaskService,
        private readonly userService: UserService,
        private readonly groupService: GroupService,
        // private readonly statusService: StatusService,
        private readonly projectService: ProjectService,
        private readonly notificationService: NotificationService,
        private readonly prisma: PrismaService,
    ) {
        const stringSession = new StringSession('');
        this.client = new TelegramClient(stringSession, this.apiId, this.apiHash, {
          connectionRetries: 5,
          retryDelay: 600
        });
    }

    async onModuleInit() {
        this.logger.log('Connecting to Telegram...');
        await this.connectToTelegram();
    }

    private async connectToTelegram() {
        let retries = 0;
        const maxRetries = 3;
        const baseDelay = 1500; 
    
        while (retries < maxRetries) {
          try {
            await this.client.start({
              botAuthToken: this.botToken,
            });
            this.logger.log('Connected to Telegram!');
    
            this.client.addEventHandler(this.handleNewMessage.bind(this), new NewMessage({}));
            // this.client.addEventHandler(this.handleNewReaction.bind(this), new EditedMessage({}));
            this.client.addEventHandler(this.handleDoneReaction.bind(this), new EventBuilder({}));

            this.logger.log('Bot is up and running!');
            return; 
          } catch (error) {
            this.logger.error(`Failed to connect to Telegram: ${error.message}`);
            if (error.code === 420 && error.errorMessage === 'FLOOD') {
              const waitTime = error.seconds * 1000;
              this.logger.warn(`FloodWaitError: Waiting for ${waitTime / 1000} seconds`);
              await this.delay(waitTime);
              retries++;
              await this.delay(baseDelay * Math.pow(2, retries));
            } else {
              this.logger.error(`Unexpected error: ${error.message}`);
              break;
            }
          }
        }
    }

    private async handleDoneReaction(event)
    {
        if(event)
        {
            if(event.className === "UpdateBotMessageReaction" && event.newReactions.length &&  event.newReactions[0].emoticon === '👍'){
                this.doneTask(event.msgId, Number(event.actor.userId), -1, true)
            }else if(event.className === "UpdateChannelParticipant")
            {
                await this.notificationService.addBotToChannel(Number(event.channelId));
            }
        }
    }

    private async handleNewMessage(event: any) {
        const message = event.message;
        if (!message) return;
        const chatId = message?.peerId;
        const messageId = message.id;
        const messageText: string = message.message;
        let topic: any;
        console.log(`Received message: ${messageText}`);
        try {
            if (messageText !== "/start") {
                const [channel, fetchedTopic] = await Promise.all([
                    this.getChannel(message.peerId.channelId),
                    this.getChannelTopics(message.peerId.channelId, messageId)
                ]);
                topic = fetchedTopic;
            }
        } catch (error) {
            console.log(`event message error :`  + error);
            return;
        }
        switch (messageText)
        {
            case "/start": 
                await Promise.all([
                    this.sendMessage(chatId, `Topshiriqlar boshqaruvchi botiga xush kelibsiz\nAssignments welcome to the managing bot\nЗадания добро пожаловать в управляющий бот`),
                    this.sendPermissionImage(message.peerId.userId)
                ]);
                break;
            case "/dashboard@plan_jet_bot":
            case "/dashboard": 
                await this.notificationService.addBotToChannel(chatId.channelId, 'en', topic);
                break;
            case "/commands@plan_jet_bot":
            case "/commands": 
                await this.notificationService.addBotToChannel(chatId.channelId, 'en', topic);
                break;
            
            case "/add@plan_jet_bot":
            case "/add":
                if(message.replyTo && topic)
                {
                    await this.createTask(chatId, message.replyTo.replyToMsgId, message.fromId.userId, topic, messageId);
                }else{
                    await this.sendMessage(chatId, "Task not found", messageId);
                }
                break;
            case "/done@plan_jet_bot":
            case "/done":
                if (message.replyTo && topic) {
                    await this.doneTask(message.replyTo.replyToMsgId, message.fromId.userId, messageId);
                } else {
                    await this.sendMessage(chatId, "Task not found", messageId);
                }
                break;
            default:
                if (message.replyTo) {
                    await this.commentCreate(message.replyTo.replyToMsgId, message.fromId.userId, messageId, messageText)
                }
                
                if(messageText.includes("#task") && topic){
                    console.log('ckhasb');
                    
                   await this.createTask(chatId, messageId, message.fromId.userId, topic, 0);
                }
                break;
        }
    }

    private async doneTask(messageId: number, userId: number, doneMessageId: number, byEmoji?: boolean)
    {
        try {
            const task = await this.prisma.task.findFirst({
                where: {
                    message_id: messageId
                },
                include: {
                    project: true
                }
            });
            if(!task) return;
            const result = await this.taskService.updateStatus(userId, -1, task.id);
            if(result?.message === "Status successfully changed")
            {
                const emojiSended = await this.client.invoke(
                    new Api.messages.SendReaction({
                        peer: `-100${task.project.group_id}`,
                        msgId: Number(messageId),
                        //   @ts-ignore
                        reaction: [new Api.ReactionEmoji({emoticon:"👍"})]
                    })
                );
                if(emojiSended && !byEmoji)
                {
                    await this.removeMessage(task.project.group_id, doneMessageId)
                }
            }
    
        } catch (error) {
            console.log("Create task error " + error);
            throw error; 
        }
    }

    private async createTask(chatId: any, messageId: number, userId: number, topic: {title?: string, id: number, name?: string, topic_id?: number}, doneMessageId: number)
    {
        try {
            const message: any = await this.client.getMessages(chatId, {ids: messageId, limit: 1});

            if(message.length === 1 && message[0] === undefined)
            {
                await this.sendMessage(chatId, "Bot is not admin, Please check admin permissions", messageId);
                return
            }

            const usernameRegex = /@\w+/g;
            const usernames =  message[0].message.match(usernameRegex);
            const messageText =  message[0].message.replace(usernameRegex, '').trim();
            const task = await this.taskService.init({
                topic_id: topic.topic_id ? topic.topic_id : Number(topic.id),
                topic_title: topic.title ? topic.title : topic.name,
                message_id: Number(messageId),
                name: messageText,
                user_id: Number(userId),
                group_id: Number(chatId.channelId)
            });
            const checkChange = await this.prisma.taskChange.create({
                data: {
                    user_id: String(userId),
                    task_id: Number(task.id),
                    type: "created",
                    old_value: "created",
                    new_value: "created"
                }
            });
            if(checkChange)
            {
                await Promise.all([
                    this.notificationService.send(task.project.group_id, checkChange.id, task.user.language_code, "createTask", task), 
                    doneMessageId && this.removeMessage(task.project.group_id, doneMessageId), 
                    this.taskService.createNotification(checkChange.id, String(userId)),
                    this.client.invoke(
                        new Api.messages.SendReaction({
                            peer: `-100${task.project.group_id}`,
                            msgId: Number(messageId),
                            //   @ts-ignore
                            reaction: [new Api.ReactionEmoji({emoticon:"🤝"})]
                        })
                    )
                ]);
            }
            if(usernames?.length)
            {
                await this.taskService.participants(usernames, task.id);
            }
        } catch (error) {
            console.log("Create task error " + error);
        }
    }    

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private async sendMessage(chatId: any, message: string, replyTo?: number)
    {
        try {
            await this.client.sendMessage(chatId, {
                message,
                replyTo: Number(replyTo),
              });
        } catch (error) {
            this.logger.error(`Failed to send message: ${error.message}`);
        }
    }

    private async getChannel(id: number){
        try {
            const result: any = await this.client.invoke(
                new Api.channels.GetChannels({
                    id: [id],
                })
            ); 
              
            if(result?.chats.length)
            {
                const checkGroup = result.chats[0];
                await this.groupService.init({id: checkGroup.id, name: checkGroup.title});
                await this.groupUser(id, checkGroup.accessHash);
            }
            
        } catch (error) {
            console.log("Get getChannel error ", error);
        }
    }

    private async groupUser(channel_id: number, accessHash: any)
    {
        try {
            const result: any = await this.client.invoke(
                new Api.channels.GetParticipants({
                    channel: channel_id,
                    filter: new Api.ChannelParticipantsRecent(),
                    offset: 0,
                    limit: 50,
                    hash: accessHash,
                })
            );

            if(result?.count > 0)
            {
                const nonBotUsers = [];

                for (const user of result.users) {
                    if (!user.bot) {
                        const checkUser = await this.userService.init({
                            id: user.id,
                            first_name: user.firstName,
                            language_code: user.langCode,
                            username: user.username,
                        });
    
                        if (checkUser) {
                            nonBotUsers.push(user.id);
                        }
                    }
                }
    
                if (nonBotUsers.length > 0) {
                    await this.groupService.checkUsers(nonBotUsers, channel_id);
                }


                // const users = result.users;
                // users.map(async (user: {
                //     id: number,
                //     bot: boolean,
                //     langCode: string,
                //     firstName: string,
                //     username: string | null,
                //     photo: {id: number} | null
                // }) => {
                //     if(!user.bot)
                //     {
                //         const checkUser = await this.userService.init({
                //             id: user.id,
                //             first_name: user.firstName,
                //             language_code: user.langCode,
                //             username: user.username,
                //         });
                //         if(checkUser)
                //         {
                //             await this.groupService.checkUsers([user.id], channel_id)
                //         }
                //     }
                // });
            }

        } catch (error) {
            console.log("Get groupUser error ", error);
            throw error; 
        }
    }

    private async getChannelTopics(channelId: number, messageId: number)
    {
        try {
            const result: any = await this.client.invoke(
                new Api.channels.GetMessages({
                    channel: channelId,
                    //  @ts-ignore
                    id: [messageId],
                })
            );

            if(result?.topics?.length)
            {
                const topic = result.topics[0];
                await this.projectService.init({groupId: channelId, id: topic.id, name: topic.title});
                return topic;
            }else{
                return await this.projectService.init({groupId: channelId, id: 1, name: "General"})
            }
        } catch (error) {
            console.log("Get topics error " + error);
        }
    }

    private async sendPermissionImage(userId: number)
    {
        const fullPath = path.join(__dirname, '..', "../public/permissions.png");
        const file = fs.readFileSync(fullPath);
        try {
            const result = await this.client.sendFile(Number(userId), {
                file: new CustomFile("permissions.png", fs.statSync(fullPath).size, "", file),
                caption: `Xizmatdan foylananish uchun ushbu ruxsatlarni bering\n
Give these permissions to file from the service\n
Предоставьте эти разрешения на использование службы`,
            });
        } catch (error) {
            console.log("Send permissions image error: "+error);
        }
    }

    private async removeMessage(channel: string, messageId: number)
    {
        try {
            return await this.client.invoke(
                new Api.channels.DeleteMessages({
                  channel: channel,
                  id: [messageId],
                })
            );
        } catch (error) {
            console.log("remove message: " + error.message);
        }
    }

    private async commentCreate(messageId: number, userId: number, commentId: number, text: string)
    {
        const user_id_str = String(userId);
        const message_id_str = String(messageId);
        const comment_id_str = String(commentId);

        const taskOrComment = await this.prisma.task.findFirst({
            where: {
                OR: [
                    { message_id: Number(messageId) },
                    { taskComment: { some: { message_id: message_id_str } } }
                ]
            },
            include: {
                taskComment: {
                    where: {
                        message_id: message_id_str
                    }
                }
            }
        });

        const taskId = taskOrComment?.id || taskOrComment?.taskComment[0]?.task_id;

        if (taskId) {
            const comment = await this.prisma.taskComment.create({
                data: {
                    task_id: taskId,
                    user_id: user_id_str,
                    message_id: comment_id_str,
                    comment: text
                }
            });
    
            if (comment) {
                await this.prisma.taskChange.create({
                    data: {
                        user_id: user_id_str,
                        task_id: taskId,
                        type: "comment",
                        old_value: "comment",
                        new_value: text
                    }
                });
            }
        }
    }
}
