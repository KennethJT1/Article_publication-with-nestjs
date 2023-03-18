import { UserEntity } from 'src1/user/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeleteResult,
  FindOneOptions,
  getRepository,
  Repository,
} from 'typeorm';
import { ArticleEntity } from './article.entity';
import { CreateArticleDto } from './dtos/createArticle.dto';
import { ArticleResponseInterface } from './types/articleResponse.interface';
import slugify from 'slugify';
import { ArticlesResponseInterface } from './types/articlesResponse.interface';
import { FollowEntity } from 'src1/profile/follow.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
  ) {}

  //GET ARRAYS OF ARTICLES
  // async findAll(
  //   currentUserId: string,
  //   query: any,
  // ): Promise<ArticlesResponseInterface> {
  //   const queryBuilder = getRepository(ArticleEntity)
  //     .createQueryBuilder('articles')
  //     .leftJoinAndSelect('articles.author', 'author');

  //   //sorting articles by tag
  //   if (query.tag) {
  //     queryBuilder.andWhere('articles.tagList LIKE: tag', {
  //       tag: `%${query.tag}`,
  //     });
  //   }

  //   //sorting articles by author
  //   if (query.author) {
  //     //to ensure we have the author field
  //     const author = await this.userRepository.findOne({
  //       where: { username: query.author },
  //     });
  //     queryBuilder.andWhere('articles.authorId =:id', {
  //       id: author.id,
  //     });
  //   }

  //   //Sorting articles by favorite
  //   if (query.favorited) {
  //     const author = await this.userRepository.findOne(
  //       { username: query.favorited },
  //       // {
  //       //   relations: ['favorites'],
  //       // },
  //     );

  //     const ids = author.favorites.map((el) => el.id);
  //     if (ids.length > 0) {
  //       queryBuilder.andWhere('articles.authorId IN (:...ids)', { ids });
  //     } else {
  //       queryBuilder.andWhere('1=0');
  //     }
  //   }

  //   //Sorting articles by descending order
  //   queryBuilder.orderBy('articles.createdAt', 'DESC');

  //   const articlesCount = await queryBuilder.getCount();

  //   if (query.limit) {
  //     queryBuilder.limit(query.limit);
  //   }

  //   if (query.offset) {
  //     queryBuilder.offset(query.offset);
  //   }

  //   //Get array of favorited and normalized it
  //   let favoriteIds: number[] = [];

  //   if (currentUserId) {
  //     const currentUser = await this.userRepository.findOne(currentUserId,
  //       // {
  //       // relations: ['favorites'],
  //       // }
  //     );

  //     favoriteIds = currentUser.favorites.map((favorite) => favorite.id);
  //   }

  //   const articles = await queryBuilder.getMany();
  //   const articleWithFavorited = articles.map((article) => {
  //     const favorited = favoriteIds.includes(article.id);
  //     return { ...article, favorited };
  //   });

  //   return { articles: articleWithFavorited, articlesCount };
  // }

  //GET FEED
  async getFeed(
    currentUserId: number,
    query: any,
  ): Promise<ArticlesResponseInterface> {
    const follows = await this.followRepository.find({
      where: {
        followerId: currentUserId,
      },
    });

    if (follows.length === 0) {
      return { articles: [], articlesCount: 0 };
    }

    const followingUserIds = follows.map((follow) => follow.followingId);
    const queryBuilder = getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author')
      .where('articles.authorId IN (:...ids', { ids: followingUserIds });

    //sort by descending order
    queryBuilder.orderBy('articles.createdAt', 'DESC');

    const articlesCount = await queryBuilder.getCount();

    if (queryBuilder.limit) {
      queryBuilder.limit(query.limit);
    }

    if (queryBuilder.offset) {
      queryBuilder.offset(query.offset);
    }

    const articles = await queryBuilder.getMany();

    return { articles, articlesCount };
  }

  //CREATE Article
  async createArticle(
    currentUser: UserEntity,
    createArticleDto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    const article = new ArticleEntity();
    Object.assign(article, createArticleDto);
    //It will throw an error since aricle is optional and the table is created therefore
    if (!article.tagList) {
      article.tagList = [];
    }

    article.slug = this.getSlug(createArticleDto.title);
    // article.author = currentUser;

    return this.articleRepository.save(article);
  }

  //GET SINGLE Article
  async findBySlug(slug: string): Promise<ArticleEntity> {
    return await this.articleRepository.findOne({ where: { slug } });
  }

  // DELETE FROM ArticleEntity
  async deleteThisArticle(
    slug: string,
    currentUserId: number,
  ): Promise<DeleteResult> {
    const article = await this.findBySlug(slug);

    //Check if the article exist
    if (!article) {
      throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND);
    }

    //Check if its the author exist
    // if (article.author.id !== currentUserId) {
    //   throw new HttpException('You are not an author', HttpStatus.FORBIDDEN);
    // }
    return await this.articleRepository.delete({ slug });
  }

  //UPDATE article
  async updateThisArticle(
    slug: string,
    updateArticleDto: CreateArticleDto,
    currentUserId: number,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);

    //Check if the article exist
    if (!article) {
      throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND);
    }

    //Check if its the author exist
    // if (article.author.id !== currentUserId) {
    //   throw new HttpException('You are not an author', HttpStatus.FORBIDDEN);
    // }

    Object.assign(article, updateArticleDto);
    return await this.articleRepository.save(article);
  }

  //Add likes
  async addArticleToFavorites(
    slug: string,
    userId: FindOneOptions<UserEntity>,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);
    const user = await this.userRepository.findOne(
      userId,
      // {
      // relations: ['favorites'],
      // }
    );
    ``;
    // const user =await this.userRepository.findOne(userId, {
    //   relations: ['favorites'],
    // });

    const isNotFavorited =
      user.favorites.findIndex(
        (articleInFavorite) => articleInFavorite.id === article.id,
      ) === -1;

    if (isNotFavorited) {
      user.favorites.push(article);
      article.favouriteCount++;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }

  //Dislike an article
  async deleteArticleFromFavorites(
    slug: string,
    userId: FindOneOptions<UserEntity>,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);
    const user = await this.userRepository.findOne(
      userId,
      // {
      // relations: ['favorites'],
      // }
    );

    const articleIndex = user.favorites.findIndex(
      (articleInFavorite) => articleInFavorite.id === article.id,
    );
    if (articleIndex >= 0) {
      user.favorites.splice(articleIndex, 1);
      article.favouriteCount--;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }

  //ARTICLE RESPONSE
  buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
    return { article };
  }

  //SLUGIFY
  private getSlug(title: string): string {
    return (
      slugify(title, { lower: true }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }
}
